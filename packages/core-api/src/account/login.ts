import { client } from "@serenity-kit/opaque";
import { callEndpoint } from "./routes";
import { Client, ElevatedClient } from "./manage";
import { decryptKey, decryptPasskeyKey } from ".";
import { getBrowser } from "../../../../applications/account-client/src/utilities";

export class PartialClient {
    constructor(private continuation: string, private password: string) {}
    needsContinuation(): this is PartialClient {
        return this instanceof PartialClient;
    }

    async continue(code: string): Promise<Client> {
        const response = await callEndpoint("login3", {
            stage: "MFA",
            continueToken: this.continuation,
            code,
        });
        const keyB = await decryptKey(response.encryptedKey, this.password);
        return new Client(null, response.token, keyB);
    };
}

export const createSession = async (email: string, password: string, escalate?: string, persist?: boolean, friendlyName?: string): Promise<Client | PartialClient> => {
    const { clientLoginState, startLoginRequest } = client.startLogin({ password });
    const response = await callEndpoint("login1", {
        stage: "BEGIN_LOGIN",
        email,
        message: startLoginRequest,
        escalate: escalate ? true : false,
        token: escalate
    });
    const result = client.finishLogin({ clientLoginState, password, loginResponse: response.message });
    if (!result) { 
        throw "INVALID_CREDENTIALS";
    }
    const response2 = await callEndpoint("login2", {
        stage: "FINISH_LOGIN",
        continueToken: response.continueToken,
        message: result.finishLoginRequest,
        persist,
        friendlyName,
    });
    if (response2.mfaEnabled) {
        return new PartialClient(response2.continueToken!, password);
    } else {
        const keyB = await decryptKey(response2.encryptedKey!, password);
        return new Client(null, response2.token!, keyB);
    }
};

export const createSessionPasskey = async (existingSession?: string): Promise<Client | undefined> => {
    const response = await callEndpoint("loginPasskey1", { escalate: existingSession ? true : false, stage: "BEGIN_LOGIN", token: existingSession });
    try {
        const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(response.message as any);
        const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential | null;
        if (credential) {
            try {
                const response2 = await callEndpoint("loginPasskey2", { stage: "FINISH_LOGIN", continueToken: response.continueToken, message: credential as any, friendlyName: getBrowser() });
                const prf = credential.getClientExtensionResults().prf?.results?.first;
                if (!prf) {
                    throw new Error("PRF extension result unavailable");
                }
                const keyB = await decryptPasskeyKey(response2.encryptedKey, prf);
                return new Client(null, response2.token, keyB);
            } catch {}
        }
    } catch {}
};

export const validateSession = async (token: string, keyB: Uint8Array, escalationToken?: string): Promise<Client> => {
    const result = await callEndpoint("validate", { token, escalationToken });
    if (result.escalated) {
        return new ElevatedClient(null, token, escalationToken!, keyB);
    }
    return new Client(null, token, keyB);
};
