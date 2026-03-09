<h1 align="center">Nextania account services client</h1>
<div align="center">
  
[![License](https://img.shields.io/github/license/nextania/account-client)](https://github.com/nextania/account-client/blob/main/LICENSE)

</div>

## About
This is the SolidJS based client for the [account services](https://github.com/nextania/account). The account services allow users to use a single account to access Nextania services. It aims to support modern authentication practices such as asymmetrical password authenticated key exchange through OPAQUE, WebAuthn (passkeys), and TOTP multi-factor authentication. 

## Configuration
- `AS_TRUSTED_SERVICES`: a list of authentication routes that the token is allowed to be sent to
- `AS_CAPTCHA_KEY`: the hCaptcha key used for registration
