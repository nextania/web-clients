import { object, string, literal, boolean, optional, Infer, is, Struct, nullable, union, array, partial, number } from "superstruct";
import { ServerError } from "./errors";
import { Profile, Session, CurrentUser, Passkey } from "./manage";

const routes = {
    login1: { 
        method: "POST" as const, 
        route: "/api/session",
        types: {
            request: object({
                stage: literal("BEGIN_LOGIN"),
                email: string(),
                message: string(),
                escalate: boolean(),
                token: optional(string()),
            }),
            response: object({
                continueToken: string(),
                message: string(),
            })
        }
    },
    login2: { 
        method: "POST" as const, 
        route: "/api/session",
        types: {
            request: object({
                stage: literal("FINISH_LOGIN"),
                continueToken: string(),
                message: string(),
                persist: optional(boolean()),
                friendlyName: optional(string()),
            }),
            response: object({
                mfaEnabled: boolean(),
                continueToken: nullable(string()),
                token: nullable(string()),
            })
        }
    },
    login3:  {
        method: "POST" as const,
        route: "/api/session",
        types: {
            request: object({
                stage: literal("MFA"),
                continueToken: string(),
                code: string(),
            }),
            response: object({
                token: string(),
            })
        }
    },
    register1: {
        method: "POST" as const,
        route: "/api/user",
        types: {
            request: object({
                stage: literal("VERIFY_EMAIL"),
                email: string(),
                captchaToken: string(),
            }),
            response: object({
                emailEnabled: boolean(),
                emailToken: nullable(string()),
            })
        }
    },
    register2: {
        method: "POST" as const,
        route: "/api/user",
        types: {
            request: object({
                stage: literal("BEGIN_REGISTRATION"),
                emailToken: string(),
                message: string(),
            }),
            response: object({
                continueToken: string(),
                message: string(),
            })
        }
    },
    register3: {
        method: "POST" as const,
        route: "/api/user",
        types: {
            request: object({
                stage: literal("REGISTER"),
                continueToken: string(),
                message: string(),
                friendlyName: optional(string()),
                username: string(),
                displayName: string(),
            }),
            response: object({
                token: string(),
            })
        }
    },
    getUser: {
        method: "GET" as const,
        route: "/api/user",
        types: {
            request: undefined,
            response: CurrentUser,
        }
    },
    updateAccount: {
        method: "PATCH" as const,
        route: "/api/user",
        types: {
            request: object({
                username: optional(string()),
                escalationToken: string(),
            }),
            response: object({})
        }
    },
    deleteAccount: {
        method: "DELETE" as const,
        route: "/api/user",
        types: {
            request: object({
                escalationToken: string(),
            }),
            response: object({})
        }
    },
    configureMfa1: {
        method: "PATCH" as const,
        route: "/api/user/mfa",
        types: {
            request: object({
                stage: literal("TOGGLE"),
                escalationToken: string(),
            }),
            response: union([object({
                continueToken: string(),
                qr: string(),
                secret: string(),
                codes: array(string()),
            }), object({})])
        }
    },
    configureMfa2: {
        method: "PATCH" as const,
        route: "/api/user/mfa",
        types: {
            request: object({
                stage: literal("ENABLE_VERIFY"),
                continueToken: string(),
                code: string(),
            }),
            response: object({})
        }
    },
    updateProfile: {
        method: "PATCH" as const,
        route: "/api/user/profile",
        types: {
            request: partial(Profile),
            response: object({})
        }
    },
    forgot1: {
        method: "POST" as const,
        route: "/api/forgot",
        types: {
            request: object({
                stage: literal("VERIFY_EMAIL"),
                email: string(),
            }),
            response: object({})
        }
    },
    forgot2: {
        method: "POST" as const,
        route: "/api/forgot",
        types: {
            request: object({
                stage: literal("RESET_PASSWORD"),
                message: string(),
                continueToken: string(),
            }),
            response: object({
                continueToken: string(),
                message: string(),
            })
        }
    },
    forgot3: {
        method: "POST" as const,
        route: "/api/forgot",
        types: {
            request: object({
                stage: literal("FINISH_RESET"),
                message: string(),
                continueToken: string(),
            }),
            response: object({})
        }
    },
    validate: {
        method: "POST" as const,
        route: "/api/validate",
        types: {
            request: object({
                token: string(),
                escalationToken: optional(string()),
            }),
            response: object({
                escalated: boolean(),
            })
        }
    },
    getSessions: {
        method: "GET" as const,
        route: "/api/session",
        types: {
            request: undefined,
            response: array(Session),
        }
    },
    logout: {
        method: "DELETE" as const,
        route: "/api/session",
        types: {
            request: undefined,
            response: object({})
        }
    },
    logoutAll: {
        method: "DELETE" as const,
        route: "/api/session/all",
        types: {
            request: undefined,
            response: object({})
        }
    },
    logoutOther: {
        method: "DELETE" as const,
        route: "/api/session/{id}",
        types: {
            request: undefined,
            response: object({})
        }
    },
    loginPasskey1: {
        method: "POST" as const,
        route: "/api/session/passkeys",
        types: {
            request: object({
                stage: literal("BEGIN_LOGIN"),
                escalate: boolean(),
                token: optional(string()),
            }),
            response: object({
                continueToken: string(),
                message: object(),
            })
        }
    },
    loginPasskey2: {
        method: "POST" as const,
        route: "/api/session/passkeys",
        types: {
            request: object({
                stage: literal("FINISH_LOGIN"),
                continueToken: string(),
                message: object(),
                persist: optional(boolean()),
                friendlyName: optional(string()),
            }),
            response: object({
                token: string(),
            })
        }
    },
    getPasskeys: {
        method: "GET" as const,
        route: "/api/user/passkeys",
        types: {
            request: undefined,
            response: array(Passkey),
        }
    },
    deletePasskey: {
        method: "DELETE" as const,
        route: "/api/user/passkeys/{id}",
        types: {
            request: object({
                escalationToken: string(),
            }),
            response: object({})
        }
    },
    registerPasskey1: {
        method: "POST" as const,
        route: "/api/user/passkeys",
        types: {
            request: object({
                stage: literal("BEGIN_REGISTER"),
                escalationToken: string(),
            }),
            response: object({
                continueToken: string(),
                message: object(),
            })
        }
    },
    registerPasskey2: {
        method: "POST" as const,
        route: "/api/user/passkeys",
        types: {
            request: object({
                stage: literal("FINISH_REGISTER"),
                continueToken: string(),
                message: object(),
                friendlyName: optional(string()),
            }),
            response: object({})
        }
    },
    updatePassword1: {
        method: "PATCH" as const,
        route: "/api/user/password",
        types: {
            request: object({
                stage: literal("BEGIN_UPDATE"),
                escalationToken: string(),
                message: string(),
            }),
            response: object({
                continueToken: string(),
                message: string(),
            })
        }
    },
    updatePassword2: {
        method: "PATCH" as const,
        route: "/api/user/password",
        types: {
            request: object({
                stage: literal("FINISH_UPDATE"),
                continueToken: string(),
                message: string(),
            }),
            response: object({})
        }
    },
    service: {
        method: "GET" as const,
        route: "/api",
        types: {
            request: undefined,
            response: object({
                service: string(),
                timestamp: number(),
                version: string(),
                cdnRoot: string(),
                registrationDisabled: boolean(),
                captchaKey: string(),
                trustedServices: array(string()),
            })
        }
    }
}

type GenericResponse<T> = { error: ServerError } | T;
type InferUndefined<T> = T extends undefined ? undefined : T extends Struct<any, any> ? Infer<T> : never;
export type Route = keyof typeof routes;
export type Method<T extends Route> = typeof routes[T]["method"];
export type ApiRequest<T extends Route> = InferUndefined<typeof routes[T]["types"]["request"]>;
export type ApiResponse<T extends Route> = Infer<typeof routes[T]["types"]["response"]>;

export const callEndpoint = async <T extends Route>(
    route: T, 
    body: Method<T> extends "GET" ? undefined : ApiRequest<T>, 
    authorization?: string, 
    replace?: Record<string, string>
): Promise<ApiResponse<T>> => {
    let headers: Record<string, string> = {};
    if (routes[route].method !== "GET") headers["Content-Type"] = "application/json";
    if (authorization) headers["Authorization"] = authorization;
    let dynamicRoute = routes[route].route;
    if (replace) {
        dynamicRoute = Object.keys(replace).reduce((acc, val) => {
            return acc.replace(`{${val}}`, replace[val]);
        }, routes[route].route);
    }
    try {
        const response: GenericResponse<ApiResponse<T>> = await fetch(dynamicRoute, {
            method: routes[route].method,
            headers,
            body: routes[route].method === "GET" ? undefined : JSON.stringify(body),
            signal: AbortSignal.timeout(10000),
        }).then(r => r.json());
        if ("error" in response) {
            if (is(response.error, ServerError)) {
                throw response.error;
            } else {
                throw "UNKNOWN_ERROR";
            }
        }
        if (!is(response, routes[route].types.response as Struct)) {
            throw "INVALID_RESPONSE";
        }
        return response;
    } catch (e) {
        if (typeof e !== "string") {
            if (e instanceof DOMException && e.name === "AbortError") {
                throw "TIMED_OUT";
            }
            throw "UNKNOWN_ERROR";
        } else {
            throw e;
        }
    }
};

