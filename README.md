<p align="center">
    <img src="docs/logo.svg" height="184px"/>
</p>

<p align="center"><i>Enhance your spiritual practice and deepen your understanding of the Vedas with Shlokas, the mobile app that makes it easy to memorize and recite Vedic verses. <a href='https://shlokas.app'>Try it out</a> today and take your spiritual journey to the next level.</i></p><br>


## Environment variables

The following environment variables are required to run the app:

| Name                        | Description                           |
| --------------------------- | ------------------------------------- |
| `AUTH_APPLE_CLIENT_ID`      | Application ID                        |
| `AUTH_APPLE_TEAM_ID`        | Team ID                               |
| `AUTH_APPLE_KEY_ID`         | Prvate Key ID                         |
| `AUTH_APPLE_KEY_PATH`       | Path to private key                   |
| `AUTH_APPLE_CALLBACK`       | Callback url                          |
| `AUTH_DB_CONNECTION`        | DB connection string with credentials |
| `AUTH_GOOGLE_CLIENT_ID`     | Google server client ID               |
| `AUTH_GOOGLE_CLIENT_SECRET` | Google server secret                  |

## Files

The following files are required to run the app:

| Name                                | Description                                                          |
| ----------------------------------- | -------------------------------------------------------------------- |
| `.data/email.auth.strategy.key`     | Private key for email auth strategy                                  |
| `.data/email.auth.strategy.key.pub` | Public key for email auth strategy                                   |
| `.data/apple.auth.strategy.key`     | Private key for apple auth strategy. Set `AUTH_APPLE_KEY_PATH` to it |

### Email authentification strategy

Generate private and public keys for email auth strategy. Put them into `.data` folder.

```sh
ssh-keygen -t rsa -b 4096 -m PEM -f email.auth.strategy.key
# Don't add passphrase
openssl rsa -in email.auth.strategy.key -pubout -outform PEM -out email.auth.strategy.key.pub
```