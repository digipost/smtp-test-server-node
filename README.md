# SMTP Test Server

This is an SMTP server for receiving emails and returning dummy SMTP responses specific to recipient addresses. This is
useful for testing. For instance, all emails to mailbox-busy@your.domain will always return Reply Code 450, which
indicates that the recipient's mailbox is busy and therefore the email cannot be accepted at this time.

## Available Addresses

The following tables describe the available recipient addresses and which SMTP codes will be replied for each of them.
The first column holds the local part of the email address. That is the part on the left-hand side of the @ in the address.
All other addresses than those listed below will respond with `550 5.1.1 Mailbox unavailable`.

The basic SMTP Reply Codes are defined in RFC 2821: [4.2.3: Reply Codes](https://www.rfc-editor.org/rfc/rfc2821#section-4.2.3).
The Enhanced Status Codes provide more detailed information about the different scenarios, and are defined by [RFC 3464 Enhanced Mail System Status Codes](https://datatracker.ietf.org/doc/html/rfc3463).

### Eventual Success

When testing transient (retryable) errors, it is also useful to have the email succeed after a
period of failing. For instance, you might want to emulate the following scenario: An email to
alice@example.com is temporarily undeliverable because Alice's mailbox is currently full. Two hours
later, Alice deletes a good portion of old emails from her mailbox, and it is now able to receive
emails again. The same email that you tried to send earlier is retried (by your system or your
email provider), and is now successfully delivered.

You can emulate this by adding a `#` and an ISO 8601 timestamp with underscores instead of colons
to the local part of any of the email addresses listed below. The email will succeed if this time
has been passed.

For instance, an email to `mailbox-full#2022-07-06T08_00_00Z@example.com` will fail with code
`452 4.2.2` _until_ July 6th 2022 at 8 AM UTC. After this, it will succeed with status 250 2.0.0.

### Addresses for Successful Responses (2.y.z)

| Email Address (Local Part) | SMTP Reply Code | Enhanced Status Code | Description                                 |
| :------------------------- | :-------------- | -------------------- | :------------------------------------------ |
| ok                         | 250             | 2.0.0                | OK – The email is accepted and all is good. |

### Addresses for Transient Error Responses (4.y.z)

| Email Address (Local Part) | SMTP Reply Code | Enhanced Status Code | Description                                        |
| :------------------------- | :-------------- | -------------------- | :------------------------------------------------- |
| shutting-down              | 421             | 4.4.2                | Service not available, the server is shutting down |
| mailbox-busy               | 450             | 4.2.1                | The mailbox is busy and unavailable                |
| service-unavailable        | 451             | 4.3.0                | Service unavailable - try again later              |
| insufficient-storage       | 452             | 4.3.1                | Insufficient system storage                        |
| mailbox-full               | 452             | 4.2.2                | The user's mailbox is full (quota exceeded)        |

### Addresses for Permanent Error Responses (5.y.z)

| Email Address (Local Part) | SMTP Reply Code | Enhanced Status Code | Description                                                     |
| :------------------------- | :-------------- | :------------------- | :-------------------------------------------------------------- |
| too-much-mail-data         | 552             | 5.2.3                | Too much mail data, i.e. the size of the email body is too big. |
| mailbox-syntax-incorrect   | 553             | 5.1.2                | Mailbox name not allowed / syntax incorrect                     |
| [All other addresses]      | 550             | 5.1.1                | Mailbox unavailable                                             |

## Hosting your own Server

In order to use this server on your own with real email addresses, you need to host this server and connect your domain to it.
We have used [fly.io](https://fly.io), as it provides a simple way of hosting a server with a static IP that can accept TCP traffic on the ports of our choosing.
Other providers might just support HTTP, but this is an SMTP server, and therefore we need to open the standard SMTP ports (25, 587, 465 and 2525).

Set up an account on Fly.io and install the `flyctl` command line tool. Log in with `flyctl auth login`.
We have already configured a `fly.toml` file, so you should be able to deploy your app by running `flyctl deploy`.

Decide on a (sub)domain to use for your emails. Let's say that it is `test.example.com`. You will want to set up two DNS records:

- An `A` record pointing to the IP address that Fly gave you for your server.
- An `MX` record with a priority value and the domain, say `0 test.example.com`.

Also, set a secret environment variable for your server pointing to the same domain:

```
flyctl secrets set DOMAIN=test.example.com
```

Now all is ready for you to start sending emails to `@test.example.com`! Note that it might take a while for the DNS records to propagate.

## Useful SMTP links

- [RFC 2821: Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc2821)
  - [4.1: Commands](https://www.rfc-editor.org/rfc/rfc2821#section-4.1)
  - [4.2.3: Reply Codes](https://www.rfc-editor.org/rfc/rfc2821#section-4.2.3)
  - [Appendix D: Scenarios](https://www.rfc-editor.org/rfc/rfc2821#appendix-D)
- [RFC 3463: Enhanced Mail System Status Codes](https://datatracker.ietf.org/doc/html/rfc3463)
