import { RequestError, ServerError } from "@nextania/core-api";

export type RenderableErrorType = 
    | "USERNAME_ALREADY_TAKEN"
    | "USER_EXISTS"
    | "USER_MISMATCH"
    | "INCORRECT_CODE"
    | "SESSION_EXPIRED" 
    | "INVALID_CAPTCHA"
    | "EMAIL_MISCONFIGURED"
    | "RATE_LIMITED" 

    | "TIMED_OUT"
    | "UNKNOWN_ERROR"
    
    | "EMPTY_EMAIL" 
    | "EMPTY_PASSWORD" 
    | "INVALID_EMAIL" 
    | "WEAK_PASSWORD"
    | "INVALID_CREDENTIALS" 
    | "EMPTY_DISPLAY_NAME" 
    | "EMPTY_USERNAME" 
    | "LONG_DISPLAY_NAME" 
    | "INVALID_USERNAME"
    | "EMPTY_CODE"
    | "INVALID_CODE"
    | "RECOVERY_KEY_INVALID";

export class RenderableError extends Error {
    constructor(public readonly type: RenderableErrorType) {
        super(type);
    }

    static fromError(error: RequestError): RenderableError {
        return new RenderableError(mapError(error));
    }

    render() {
        return this.type;
    }
}

export const mapError = (error: RequestError): RenderableErrorType => {
    if (["USERNAME_ALREADY_TAKEN", "USER_EXISTS", "USER_MISMATCH", "INCORRECT_CODE", "SESSION_EXPIRED", "INVALID_CAPTCHA", "EMAIL_MISCONFIGURED", "RATE_LIMITED", "TIMED_OUT", "UNKNOWN_ERROR"].includes(error)) {
        return error as RenderableErrorType;
    }
    return "UNKNOWN_ERROR";
};

