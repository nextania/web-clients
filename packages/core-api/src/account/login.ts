import { client } from "@serenity-kit/opaque";
import { callEndpoint } from "./routes";
import { Client, ElevatedClient } from "./manage";

export class PartialClient {
    constructor(private continuation: string) {}
    needsContinuation(): this is PartialClient {
        return this instanceof PartialClient;
    }

    async continue(code: string): Promise<Client> {
        const response = await callEndpoint("login3", {
            stage: "MFA",
            continueToken: this.continuation,
            code,
        });
        return new Client(null, response.token);
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
        return new PartialClient(response2.continueToken!);
    } else {
        return new Client(null, response2.token!);
    }
};


export const validateSession = async (token: string, escalationToken?: string): Promise<Client> => {
    const result = await callEndpoint("validate", { token, escalationToken });
    if (result.escalated) {
        return new ElevatedClient(null, token, escalationToken!);
    }
    return new Client(null, token);
};
