import { createServer } from "net";

const DOMAIN = process.env.DOMAIN ?? "example.com";
const PORT = process.env.PORT ?? 2525;

const server = createServer();

function getResponseForRCPT(chunk) {
  const recipientAddress = chunk.match(/<(.*)>/)[1];

  if (!recipientAddress) {
    return "500 5.1.3 Syntax error";
  }

  const recipient = recipientAddress.slice(0, recipientAddress.indexOf("@"));

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

server.on("connection", (connection) => {
  console.log("Connection established");

  const send = (data) => {
    const message = Array.isArray(data) ? data.join("\n") : data;
    connection.write(message + "\n", () => console.log("Sent: " + message));
  };

  send(`220 ${DOMAIN} Service ready`);

  let isProcessingData = false;

  connection.on("data", (chunkBuffer) => {
    const chunk = chunkBuffer.toString();
    console.log("\n--- chunk START");
    console.log(chunk);
    console.log("--- chunk END\n");

    const command = chunk.slice(0, 4).toUpperCase();

    switch (command) {
      case "EHLO":
        return send([`250-${DOMAIN} greets you`, "250 OK"]);
      case "HELO":
        return send(`250 ${DOMAIN}`);
      case "RCPT":
        return send(getResponseForRCPT(chunk));
      case "DATA":
        isProcessingData = true;
        return send("354 Start mail input; end with <CRLF>.<CRLF>");
      case "VRFY":
        return send(
          "252 Cannot VRFY user, but will accept message and attempt delivery"
        );
      case "QUIT": {
        send(`221 ${DOMAIN} Service closing transmission channel`);
        connection.end();
        return;
      }
      case "HELP":
      case "EXPN":
        return send("502 Command not implemented");
      default: {
        if (!isProcessingData) {
          return send("250 OK");
        }

        const trimmed = chunk.trimEnd();
        const isEndCharacter = trimmed === "." || trimmed.endsWith("\n.");

        if (isEndCharacter) {
          isProcessingData = false;
          return send("250 OK");
        }
      }
    }
  });
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
