import { client } from "@serenity-kit/opaque";
import { callEndpoint } from "./routes";
import { Client } from "./manage";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { managedNonce } from "@noble/ciphers/utils.js";
import { encode, encryptKey } from ".";

export type RegistrationResult = { client: Client; recoveryKey: Uint8Array };

export type RegistrationContinuation = {
    emailEnabled: true;
    continue: (username: string, password: string, displayName: string, emailToken: string, friendlyName?: string) => Promise<RegistrationResult>;
} | {
    emailEnabled: false;
    continue: (username: string, password: string, displayName: string, friendlyName?: string) => Promise<RegistrationResult>;
}

export const createAccount = async (email: string, captchaToken: string): Promise<RegistrationContinuation> => {
    const response = await callEndpoint("register1", {
        stage: "VERIFY_EMAIL",
        email,
        captchaToken,
    });
    if (!response.emailEnabled) {
        return {
            emailEnabled: false,
            continue: async (username: string, password: string, displayName: string, friendlyName?: string): Promise<RegistrationResult> => {
                const data = client.startRegistration({ password });
                const response1 = await callEndpoint("register2", {
                    stage: "BEGIN_REGISTRATION",
                    emailToken: response.emailToken!,
                    message: data.registrationRequest,
                });
                const data2 = client.finishRegistration({ 
                    password, 
                    clientRegistrationState: data.clientRegistrationState, 
                    registrationResponse: response1.message 
                });
                // Key B - our master key for encrypting user data
                const keyB = crypto.getRandomValues(new Uint8Array(32));
                const encryptedKey = await encryptKey(keyB, password);
                // Generate a recovery key for the user to regain access to their data if they forget their password
                const recoveryKey = crypto.getRandomValues(new Uint8Array(32));
                const recoveryEncrypted = managedNonce(xchacha20poly1305)(recoveryKey).encrypt(keyB);
                const recoveryEncryptedKey = encode(recoveryEncrypted);
                const response2 = await callEndpoint("register3", {
                    stage: "REGISTER",
                    continueToken: response1.continueToken,
                    message: data2.registrationRecord,
                    displayName,
                    username,
                    friendlyName,
                    encryptedKey,
                    recoveryEncryptedKey,
                });
                return { client: new Client(null, response2.token, keyB), recoveryKey };
            },
        }
    } else {
        return {
            emailEnabled: true,
            continue: async (username: string, password: string, displayName: string, emailToken: string, friendlyName?: string): Promise<RegistrationResult> => {
                const data = client.startRegistration({ password });
                const response = await callEndpoint("register2", {
                    stage: "BEGIN_REGISTRATION",
                    emailToken,
                    message: data.registrationRequest,
                });
                const data2 = client.finishRegistration({ 
                    password, 
                    clientRegistrationState: data.clientRegistrationState, 
                    registrationResponse: response.message 
                });
                // Key B - our master key for encrypting user data
                const keyB = crypto.getRandomValues(new Uint8Array(32));
                const encryptedKey = await encryptKey(keyB, password);
                // Generate a recovery key for the user to regain access to their data if they forget their password
                const recoveryKey = crypto.getRandomValues(new Uint8Array(32));
                const recoveryEncrypted = managedNonce(xchacha20poly1305)(recoveryKey).encrypt(keyB);
                const recoveryEncryptedKey = encode(recoveryEncrypted);
                const response2 = await callEndpoint("register3", {
                    stage: "REGISTER",
                    continueToken: response.continueToken,
                    message: data2.registrationRecord,
                    displayName,
                    username,
                    friendlyName,
                    encryptedKey,
                    recoveryEncryptedKey,
                });
                return { client: new Client(null, response2.token, keyB), recoveryKey };
            }
        }
    }
};
