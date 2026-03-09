import { literal, Struct, union } from "superstruct";

export type ServerError = 
    | "MISSING_TOKEN" // shouldn't happen
    | "INVALID_TOKEN" // not displayed to user
    | "DATABASE_ERROR" // internal error
    | "INVALID_USERNAME" // shouldn't happen
    | "USERNAME_ALREADY_TAKEN" // The username is already in use
    | "USER_NOT_FOUND" // shouldn't happen
    | "USER_EXISTS" // The email is already in use (Only if mail server is not in use)
    | "USER_MISMATCH" // Escalating to a different user
    | "INVALID_EMAIL" // shouldn't happen
    | "DISPLAY_NAME_TOO_LONG" // shouldn't happen
    | "DESCRIPTION_TOO_LONG" // shouldn't happen
    | "WEBSITE_TOO_LONG" // shouldn't happen
    | "CREDENTIAL_ERROR" // shouldn't happen
    | "INCORRECT_CODE" // The MFA code is incorrect
    | "SESSION_EXPIRED" // The session has expired
    | "IP_MISSING" // shouldn't happen
    | "INVALID_CAPTCHA" // The captcha token is invalid
    | "INTERNAL_CAPTCHA_ERROR" // shouldn't happen
    | "INTERNAL_EMAIL_ERROR" // shouldn't happen
    | "EMAIL_MISCONFIGURED" // The SMTP server is not configured
    | "RATE_LIMITED"; // The user has sent too many requests
export const ServerError: Struct<ServerError> = union([
    literal("MISSING_TOKEN"),
    literal("INVALID_TOKEN"),
    literal("DATABASE_ERROR"),
    literal("INVALID_USERNAME"),
    literal("USERNAME_ALREADY_TAKEN"),
    literal("USER_NOT_FOUND"),
    literal("USER_EXISTS"),
    literal("USER_MISMATCH"),
    literal("INVALID_EMAIL"),
    literal("DISPLAY_NAME_TOO_LONG"),
    literal("DESCRIPTION_TOO_LONG"),
    literal("WEBSITE_TOO_LONG"),
    literal("CREDENTIAL_ERROR"),
    literal("INCORRECT_CODE"),
    literal("SESSION_EXPIRED"),
    literal("IP_MISSING"),
    literal("INVALID_CAPTCHA"),
    literal("INTERNAL_CAPTCHA_ERROR"),
    literal("INTERNAL_EMAIL_ERROR"),
    literal("EMAIL_MISCONFIGURED"),
    literal("RATE_LIMITED")
]);

export type RequestError = ServerError
    | "INVALID_RESPONSE"
    | "TIMED_OUT"
    | "UNKNOWN_ERROR"
    | "INVALID_CREDENTIALS" ;
