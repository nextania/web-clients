import { client } from "@serenity-kit/opaque";
import { callEndpoint } from "./routes";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { managedNonce } from "@noble/ciphers/utils.js";
import { encode, encryptKey } from ".";

export const forgotPassword = async (email: string): Promise<void> => {
    await callEndpoint("forgot1", { stage: "VERIFY_EMAIL", email });
    // FIXME: add strings and use "UNSUPPORTED" instead
};

export type ForgotContinuation = (recoveryKey: Uint8Array) => Promise<Uint8Array>;

export const finishResetPassword = async (password: string, continueToken: string): Promise<ForgotContinuation> => {
    const { clientRegistrationState, registrationRequest } = client.startRegistration({ password });
    const response = await callEndpoint("forgot2", { stage: "RESET_PASSWORD", message: registrationRequest, continueToken });
    const data = client.finishRegistration({ registrationResponse: response.message, clientRegistrationState, password });
    return async (recoveryKey: Uint8Array): Promise<Uint8Array> => {
        // Decrypt key B using the recovery key, re-encrypt it with the new password, and rotate the recovery key
        const encryptedKeyB = atob(response.recoveryEncryptedKey);
        const encrypted = new Uint8Array(encryptedKeyB.split("").map(c => c.charCodeAt(0)));
        const keyB = managedNonce(xchacha20poly1305)(recoveryKey).decrypt(encrypted);
        const encryptedKey = await encryptKey(keyB, password);

        const rotatedRecoveryKey = crypto.getRandomValues(new Uint8Array(32));
        const recoveryEncrypted = managedNonce(xchacha20poly1305)(rotatedRecoveryKey).encrypt(keyB);
        const recoveryEncryptedKey = encode(recoveryEncrypted);
        await callEndpoint("forgot3", { stage: "FINISH_RESET", message: data.registrationRecord, continueToken, encryptedKey, recoveryEncryptedKey });
        // Return the new recovery key so the user can store it securely
        return rotatedRecoveryKey;
    };
};
