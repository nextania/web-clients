import { boolean, Infer, nullable, object, omit, optional, string } from "superstruct";
import { ApiRequest, ApiResponse, callEndpoint, Method, Route } from "./routes";
import { PartialClient } from "./login";
import { client } from "@serenity-kit/opaque";
import { create } from "@github/webauthn-json";

export const CurrentUser = object({
    id: string(),
    email: nullable(string()),
    username: string(),
    mfaEnabled: boolean(),
    displayName: string(),
    description: string(),
    avatar: nullable(string()),
    oidcProvider: nullable(string()),
});

export const PublicUser = omit(CurrentUser, ["email", "mfaEnabled"]);

export type CurrentUser = Infer<typeof CurrentUser>;

export type PublicUser = Infer<typeof PublicUser>;

export const Profile = object({
    displayName: string(),
    description: string(),
    website: string(),
    avatar: nullable(string()),
});

export type Profile = Infer<typeof Profile>;

export const Session = object({
    id: string(),
    friendlyName: string(),
    ip: optional(string()),
});

export type Session = Infer<typeof Session>;

export const Passkey = object({
    id: string(),
    friendlyName: string(),
});

export type Passkey = Infer<typeof Passkey>;

export class Client {
    constructor(private id: string | null, private accessToken: string) {}
    needsContinuation(): this is PartialClient {
        return this instanceof PartialClient;
    }

    isElevated(): this is ElevatedClient {
        return this instanceof ElevatedClient;
    }

    get token(): string {
        return this.accessToken;
    }

    protected callEndpoint<T extends Route>(route: T, body: Method<T> extends "GET" ? undefined : ApiRequest<T>, replace?: Record<string, string>): Promise<ApiResponse<T>> {
        return callEndpoint(route, body, this.accessToken, replace);
    }

    async getSettings(): Promise<CurrentUser> {
        return await this.callEndpoint("getUser", undefined);
    }


    async commitProfile(profile: Partial<Profile>): Promise<void> {
        await this.callEndpoint("updateProfile", profile);
    }

    async getAllSessions(): Promise<Session[]> {
        return await this.callEndpoint("getSessions", undefined);
    }

    async logoutAll(): Promise<void> {
        await this.callEndpoint("logoutAll", undefined);
    }

    async logout(id?: string): Promise<void> {
        if (id) {
            await this.callEndpoint("logoutOther", undefined, { id });
        } else {
            await this.callEndpoint("logout", undefined);
        }
    }

    async getPasskeys(): Promise<Passkey[]> {
        return await this.callEndpoint("getPasskeys", undefined);
    }
}

interface AccountSettings {
    username?: string;
}


export type MfaContinueFunction = (code: string) => Promise<void>;

export type MfaOperation = {
    pendingEnable: false;
} | {
    continue: MfaContinueFunction;
    qr: string;
    secret: string;
    pendingEnable: true;
    codes: string[];
}

export class ElevatedClient extends Client {
    constructor(id: string | null, token: string, private escalationToken: string) {
        super(id, token);
    }

    isElevated(): this is ElevatedClient {
        return this instanceof ElevatedClient;
    }

    async commitAccountSettings(settings: AccountSettings): Promise<void> {
        await this.callEndpoint("updateAccount", { ...settings, escalationToken: this.escalationToken });
    }

    async updatePassword(password: string): Promise<void> {
        const { clientRegistrationState, registrationRequest } = client.startRegistration({ password });
        const response = await this.callEndpoint("updatePassword1", { escalationToken: this.escalationToken, message: registrationRequest, stage: "BEGIN_UPDATE" });
        const result = client.finishRegistration({ clientRegistrationState, password, registrationResponse: response.message });
        await this.callEndpoint("updatePassword2", { continueToken: response.continueToken, message: result.registrationRecord, stage: "FINISH_UPDATE" });
    }

    async deleteAccount(): Promise<void> {
        await this.callEndpoint("deleteAccount", { escalationToken: this.escalationToken });
    }

    async configureMfa(): Promise<MfaOperation> {
        const response = await this.callEndpoint("configureMfa1", { stage: "TOGGLE", escalationToken: this.escalationToken });
        if ("qr" in response) {
            return {
                continue: async (code: string) => {
                    await this.callEndpoint("configureMfa2", { stage: "ENABLE_VERIFY", continueToken: response.continueToken, code });
                },
                qr: response.qr,
                secret: response.secret,
                pendingEnable: true,
                codes: response.codes,
            };
        } else {
            return { pendingEnable: false };
        }
    }

    async deletePasskey(id: string): Promise<void> {
        await this.callEndpoint("deletePasskey", { escalationToken: this.escalationToken }, { id });
    }

    async createPasskey(): Promise<void> {
        const result = await this.callEndpoint("registerPasskey1", { escalationToken: this.escalationToken, stage: "BEGIN_REGISTER" });
        const credential = await create(result.message as any);
        if (credential) {
            await this.callEndpoint("registerPasskey2", { stage: "FINISH_REGISTER", continueToken: result.continueToken, message: credential as any });
        } else {
            throw new Error("No passkey provided");
        }
    }
}
