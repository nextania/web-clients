import { ApiResponse, callEndpoint } from "./routes";
import { Client } from "./manage";
import { get } from "@github/webauthn-json";
import { getBrowser } from "../../../../applications/account-client/src/utilities/client";

export interface Settings {
    id: string;
    username: string;
    mfaEnabled: boolean;
    displayName: string;
    description: string;
    avatar: string;
}


export interface AccountSettings {
    username: string;
    newPassword: string;
}

export interface Profile {
    displayName: string;
    description: string;
    avatar: string;
}


export interface Credentials {
    email: string;
    password: string;
    displayName: string;
    username: string;
    captchaToken: string;
}


export const createSessionPasskey = async (existingSession?: string) => {
    const response = await callEndpoint("loginPasskey1", { escalate: existingSession ? true : false, stage: "BEGIN_LOGIN", token: existingSession });
    try {
        const credential = await get(response.message);
        if (credential) {
            try {
                const response2 = await callEndpoint("loginPasskey2", { stage: "FINISH_LOGIN", continueToken: response.continueToken, message: credential as any, friendlyName: getBrowser(),  });
                return new Client(null, response2.token);
            } catch {}
        }
    } catch {}
};

export const getServerConfiguration = (): Promise<ServerConfiguration> => {
    return callEndpoint("service", undefined);
};
export type ServerConfiguration = ApiResponse<"service">;

export * from "./errors";
export * from "./manage";
export * from "./registration";
export * from "./login";
export * from "./forgot";
