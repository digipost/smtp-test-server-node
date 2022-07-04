# SMTP Test Server

This is an SMTP server for receiving emails and returning dummy SMTP responses specific to recipient addresses. This is
useful for testing. For instance, all emails to mailbox-busy@your.domain will always return Reply Code 450, which
indicates that the recipient's mailbox is busy and therefore the email cannot be accepted at this time.

## Available Addresses

The following tables describe the available recipient addresses and which SMTP codes will be replied for each of them.
The first column holds the local part of the email address. That is the part on the left-hand side of the @ in the address.
All other addresses than those listed below will respond with 550 Mailbox unavailable.

You can find the list of SMTP's reply codes here: [4.2.3: Reply Codes](https://www.rfc-editor.org/rfc/rfc2821#section-4.2.3).

### Addresses for Successful Responses (2.y.z)

| Email Address (Local Part) | SMTP Reply Code | Description                                 |
| :------------------------- | :-------------- | :------------------------------------------ |
| ok                         | 250             | OK – The email is accepted and all is good. |

### Addresses for Transient Error Responses (4.y.z)

| Email Address (Local Part) | SMTP Reply Code | Description                                        |
| :------------------------- | :-------------- | :------------------------------------------------- |
| shutting-down              | 421             | Service not available, the server is shutting down |
| mailbox-busy               | 450             | The mailbox is busy and unavailable                |
| service-unavailable        | 451             | Service unavailable - try again later              |
| insufficient-storage       | 452             | Insufficient system storage                        |

### Addresses for Permanent Error Responses (5.y.z)

| Email Address (Local Part) | SMTP Reply Code | Description                                                     |
| :------------------------- | :-------------- | :-------------------------------------------------------------- |
| too-much-mail-data         | 552             | Too much mail data, i.e. the size of the email body is too big. |
| mailbox-syntax-incorrect   | 553             | Mailbox name not allowed / syntax incorrect                     |
| <All other addresses>      | 550             | Mailbox unavailable                                             |

## Useful SMTP links

- [RFC 2821: Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc2821)
  - [4.1: Commands](https://www.rfc-editor.org/rfc/rfc2821#section-4.1)
  - [4.2.3: Reply Codes](https://www.rfc-editor.org/rfc/rfc2821#section-4.2.3)
  - [Appendix D: Scenarios](https://www.rfc-editor.org/rfc/rfc2821#appendix-D)
