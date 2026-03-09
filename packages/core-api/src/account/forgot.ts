import { client } from "@serenity-kit/opaque";
import { callEndpoint } from "./routes";

export const forgotPassword = async (email: string): Promise<void> => {
    await callEndpoint("forgot1", { stage: "VERIFY_EMAIL", email });
    // FIXME: add strings and use "UNSUPPORTED" instead
};

export const finishResetPassword = async (password: string, continueToken: string): Promise<void> => {
    const { clientRegistrationState, registrationRequest } = client.startRegistration({ password });
    const response = await callEndpoint("forgot2", { stage: "RESET_PASSWORD", message: registrationRequest, continueToken });
    const data = client.finishRegistration({ registrationResponse: response.message, clientRegistrationState, password });
    await callEndpoint("forgot3", { stage: "FINISH_RESET", message: data.registrationRecord, continueToken });
};
