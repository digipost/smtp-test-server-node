# SMTP Test Server

This is an SMTP server for receiving emails and returning dummy SMTP responses specific to recipient addresses. This is
useful for testing. For instance, all emails to mailbox-busy@your.domain will always return Reply Code 450, which
indicates that the recipient's mailbox is busy and therefore the email cannot be accepted at this time.

| Email Address (Local Part) | SMTP Reply Code | Description                                                               |
| :------------------------- | :-------------- | :------------------------------------------------------------------------ |
| ok                         | 250             | OK – The email is accepted and all is good.                               |
| too-many-recipients        | 452             | Too many recipients                                                       |
| shutting-down              | 421             | Service not available, closing transmission channel                       |
| mailbox-busy               | 450             | Requested mail action not taken: mailbox unavailable (e.g., mailbox busy) |
| too-much-mail-data         | 552             | Too much mail data, i.e. the size of the email body is too big.           |

All other email addresses will return 550 Mailbox Unavailable.

## Useful SMTP links

- [RFC 2821: Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc2821)
  - [4.1: Commands](https://www.rfc-editor.org/rfc/rfc2821#section-4.1)
  - [4.2.3: Reply Codes](https://www.rfc-editor.org/rfc/rfc2821#section-4.2.3)
  - [Appendix D: Scenarios](https://www.rfc-editor.org/rfc/rfc2821#appendix-D)
