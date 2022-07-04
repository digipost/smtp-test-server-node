import { createServer } from "net";

const DOMAIN = process.env.DOMAIN ?? "example.com";
const PORT = process.env.PORT ?? 2525;

const server = createServer();

function sendToSocket(socket, data) {
  const message = Array.isArray(data) ? data.join("\n") : data;
  socket.write(message + "\n", () => console.log("Sent: " + message));
}

function getResponseForRecipient(recipient) {
  switch (recipient) {
    case "ok":
      return "250 OK";
    case "mailbox-busy":
      return "450 Mailbox busy";
    case "too-many-recipients":
      return "452 Too many recipients";
    case "too-much-mail-data":
      return "552 Too much mail data";
    default:
      return "550 Requested action not taken: mailbox unavailable";
  }
}

function isCommand(chunk, command) {
  return new RegExp("^" + command, "i").test(chunk);
}

function handleChunk(socket, chunk) {
  const send = (message) => sendToSocket(socket, message);
  const isCmd = (command) => isCommand(chunk, command);

  if (isCmd("EHLO")) {
    return send([`250-${DOMAIN} greets you`, "250 OK"]);
  }

  if (isCmd("HELO")) {
    return send(`250 ${DOMAIN}`);
  }

  if (isCmd("DATA")) {
    return send("354 Start mail input; end with <CRLF>.<CRLF>");
  }

  if (isCmd("HELP") || isCmd("EXPN")) {
    return send("502 Command not implemented");
  }

  if (isCmd("VRFY")) {
    return send(
      "252 Cannot VRFY user, but will accept message and attempt delivery"
    );
  }

  if (isCmd("QUIT")) {
    send(`221 ${DOMAIN} Service closing transmission channel`);
    socket.end();
    return;
  }

  if (!isCmd("RCPT TO")) {
    return send("250 OK");
  }

  const recipientAddress = chunk.match(/<(.*)>/)[1];
  console.log("recipientAddress:", recipientAddress);

  if (!recipientAddress) {
    return send("500 Syntax error");
  }

  const recipient = recipientAddress.slice(0, recipientAddress.indexOf("@"));

  return send(getResponseForRecipient(recipient));
}

server.on("connection", (connection) => {
  console.log("server connection");

  connection.on("data", (chunkBuffer) => {
    const chunk = chunkBuffer.toString();
    console.log("\n--- chunk START");
    console.log(chunk.trim());
    console.log("--- chunk END\n");
    handleChunk(connection, chunk);
  });

  sendToSocket(connection, `220 ${DOMAIN} Service ready`);
});

server.listen(
  {
    host: "0.0.0.0",
    port: PORT,
  },
  () => {
    console.log("opened server on", server.address());
  }
);
