import Dialog from "@corvu/dialog";
import { Content, Overlay } from "../Dialog";
import { createMemo, createSignal, Match, onMount, Show, Switch } from "solid-js";
import { Button, Box, OtpInput } from "@nextania/ui";
import { useGlobalState, useUserState } from "../../context";
import { MfaContinueFunction, RequestError } from "@nextania/core-api";
import { useTranslate } from "../../i18n";
import { RenderableError, RenderableErrorType } from "../../errors";

type AuthenticateStage =  "ONBOARD" | "MFA";
type AuthenticateError = RenderableErrorType | "EMPTY_CODE" | "INVALID_CODE";

const Mfa = () => {
    const [stage, setStage] = createSignal<AuthenticateStage>("ONBOARD");
    const [qrCode, setQrCode] = createSignal<string>("");
    const [codes, setCodes] = createSignal<string[]>([]);
    const [secret, setSecret] = createSignal<string>("");
    const [mfaCode, setMfaCode] = createSignal<string>("");
    const [continueFunction, setContinueFunction] = createSignal<MfaContinueFunction>();
    const [error, setError] = createSignal<AuthenticateError>();
    const dialogContext = createMemo(() => Dialog.useContext());
    const t = useTranslate();
    const userState = useUserState();
    const globalState = useGlobalState();

    onMount(async () => {
        if (!userState.session.isElevated()) return console.error("Session should be elevated");
        try {
            const result = await userState.session.configureMfa();
        
            if (!result.pendingEnable) {
                // no pending enable, so we're done
                closeDialog();
                return;
            } else {
                setQrCode(result.qr);
                setCodes(result.codes);
                setSecret(result.secret);
                setContinueFunction(() => result.continue);
            }
        } catch (e) {
            const error = RenderableError.fromError(e as RequestError).render();
            setError(error);
        }
    });
    
    const next = async () => {
        if (error()) setError(undefined);
        globalState.setLoading(true);
        if (stage() === "ONBOARD") {            
            //transition to next stage
            setStage("MFA");
        } else
        if (stage() === "MFA") {
            const cf = continueFunction();
            if (!cf) return console.error("No continue function found");
            if (!mfaCode()) return setError("EMPTY_CODE");
            if (mfaCode().length !== 8) return setError("INVALID_CODE");
            try {
                await cf(mfaCode());
                userState.updateSettings({ mfaEnabled: true });
                closeDialog();
            } catch (e) {
                const error = RenderableError.fromError(e as RequestError).render();
                setError(error === "INVALID_CREDENTIALS" ? "INVALID_CODE" : error);
            }
        }
        globalState.setLoading(false);
    };

    const closeDialog = () => {
        dialogContext().setOpen(false);
        setStage("ONBOARD");
        setMfaCode("");
        setQrCode("");  
        setCodes([]);
        setSecret("");
        setContinueFunction(undefined);
    };

    return (
        <>
            <Dialog.Portal>
                <Overlay />
                <Content>
                    <Switch fallback={
                        <>
                            <h1>Invalid dialog type</h1>
                            <p>This is an error.</p>
                        </>
                    }>
                        <Match when={stage() === "ONBOARD"}>
                            <h1>{t("MFA_SETUP")}</h1>
                            <img src={`data:image/png;base64,${qrCode()}`} alt="QR code" width="300" height="300" />
                            <p>{t("MFA_SETUP_SECRET")}</p>
                            <p>{secret()}</p>
                            <p style={{ "text-align": "center" }}>{t("MFA_SETUP_BACKUP")}</p>
                            <p>{codes().join("\n")}</p>
                            <p>{t("MFA_SETUP_NEVER_SHOWN_AGAIN")}</p>
                        </Match>
                        <Match when={stage() === "MFA"}>
                            <h1>{t("ENTER_CODE")}</h1>
                            <OtpInput code={mfaCode} setCode={setMfaCode} />
                            <Button onClick={() => setStage("ONBOARD")} disabled={globalState.loading()}>{t("BACK")}</Button>
                        </Match>
                    </Switch>
                    <Show when={error() !== undefined}>
                        <Box type="error">
                            {error()}
                        </Box>
                    </Show>
                    <Button onClick={next} disabled={globalState.loading()}>{t("CONTINUE")}</Button>
                    <Button onClick={closeDialog} disabled={globalState.loading()}>{t("CANCEL")}</Button>
                </Content>
            </Dialog.Portal>
        </>
    )
};

export default Mfa;