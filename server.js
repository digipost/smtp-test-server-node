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
      return "250 2.0.0 OK";
    case "shutting-down":
      return "421 4.4.2 Shutting down";
    case "mailbox-busy":
      return "450 4.2.1 Mailbox busy";
    case "service-unavailable":
      return "451 4.3.0 Service unavailable - try again later";
    case "insufficient-storage":
      return "452 4.3.1 Insufficient system storage";
    case "mailbox-full":
      return "452 4.2.2 The user's mailbox is full (quota exceeded)";
    case "too-much-mail-data":
      return "552 5.2.3 Too much mail data";
    case "mailbox-syntax-incorrect":
      return "553 5.1.2 Mailbox name not allowed / syntax incorrect";
    default:
      return "550 5.1.1 Requested action not taken: mailbox unavailable";
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

  if (!recipientAddress) {
    return send("500 5.1.3 Syntax error");
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
