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
