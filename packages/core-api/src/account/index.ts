import { ApiResponse, callEndpoint } from "./routes";
// @ts-expect-error - Vite has issues with importing `argon2-browser` directly due to WASM
import { ArgonType, hash } from "argon2-browser/dist/argon2-bundled.min.js";
import { managedNonce } from "@noble/ciphers/utils.js";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";

export const bytesToHex = (bytes: Uint8Array): string =>
    Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");

export const hexToBytes = (hex: string): Uint8Array | undefined => {
    const clean = hex.replace(/\s+/g, "");
    if (clean.length % 2 !== 0) return;
    const result = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
        result[i / 2] = parseInt(clean.slice(i, i + 2), 16);
    }
    return result;
};

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


export const getServerConfiguration = (): Promise<ServerConfiguration> => {
    return callEndpoint("service", undefined);
};
export type ServerConfiguration = ApiResponse<"service">;

export const encode = (data: Uint8Array): string => {
    return btoa(String.fromCharCode(...data)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_"); // URL-safe base64 without padding
}

export const decode = (data: string): Uint8Array => {
    return Uint8Array.from(atob(data.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
}

export const encryptKey = async (key: Uint8Array, password: string): Promise<string> => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hashedPassword = await hash({
        pass: password,
        salt,
        type: ArgonType.Argon2id,
        hashLen: 32,
    });
    // Encrypt key with a key derived from the user's password using argon2id
    const encrypted = managedNonce(xchacha20poly1305)(hashedPassword.hash).encrypt(key);
    const combined = new Uint8Array(salt.length + encrypted.length);
    combined.set(salt);
    combined.set(encrypted, salt.length);
    const encryptedKey = encode(combined);
    return encryptedKey;
}

export const decryptKey = async (encryptedKey: string, password: string): Promise<Uint8Array> => {
    const combined = decode(encryptedKey);
    const salt = combined.slice(0, 16);
    const encrypted = combined.slice(16);
    const hashedPassword = await hash({
        pass: password,
        salt,
        type: ArgonType.Argon2id,
        hashLen: 32,
    });
    return managedNonce(xchacha20poly1305)(hashedPassword.hash).decrypt(encrypted);
};

// Decrypt key B that was encrypted using a passkey-derived key.
// encryptedKey format: [16-byte HKDF salt][xchacha20 ciphertext with prepended nonce]
export const decryptPasskeyKey = async (encryptedKey: string, prfResult: ArrayBuffer | ArrayBufferView): Promise<Uint8Array> => {
    const buffer: ArrayBuffer = prfResult instanceof ArrayBuffer ? prfResult : prfResult.buffer.slice(prfResult.byteOffset, prfResult.byteOffset + prfResult.byteLength) as ArrayBuffer;
    const combined = decode(encryptedKey);
    const salt = combined.slice(0, 16);
    const encrypted = combined.slice(16);
    const baseKey = await crypto.subtle.importKey("raw", buffer, { name: "HKDF" }, false, ["deriveBits"]);
    const info = new TextEncoder().encode("nextania-passkey");
    const derivedKeyBits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, baseKey, 256);
    return managedNonce(xchacha20poly1305)(new Uint8Array(derivedKeyBits)).decrypt(encrypted);
};

export * from "./errors";
export * from "./manage";
export * from "./registration";
export * from "./login";
export * from "./forgot";
