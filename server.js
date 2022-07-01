import { createServer } from "net";

/**
 *
 * SMTP
 *
 * Commands:
 * https://www.rfc-editor.org/rfc/rfc2821#section-4.1
 *
 * Reply Codes:
 * https://www.rfc-editor.org/rfc/rfc2821#section-4.2.3
 *
 * Scenarios:
 * https://www.rfc-editor.org/rfc/rfc2821#appendix-D
 */

const DOMAIN = process.env.DOMAIN ?? "example.com";

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

  if (isCommand("EHLO")) {
    return send([`250-${DOMAIN} greets you`, "250 OK"]);
  }

  if (isCommand("HELO")) {
    return send(`250 ${DOMAIN}`);
  }

  if (isCommand("DATA")) {
    return send("354 Start mail input; end with <CRLF>.<CRLF>");
  }

  if (isCommand("HELP") || isCommand("EXPN")) {
    return send("502 Command not implemented");
  }

  if (isCommand("VRFY")) {
    return send(
      "252 Cannot VRFY user, but will accept message and attempt delivery"
    );
  }

  if (isCommand("QUIT")) {
    send(`221 ${DOMAIN} Service closing transmission channel`);
    socket.end();
    return;
  }

  if (!isCommand("RCPT TO")) {
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
    port: 2525,
  },
  () => {
    console.log("opened server on", server.address());
  }
);
