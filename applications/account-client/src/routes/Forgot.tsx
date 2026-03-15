import { createSignal, JSX, Match, onMount } from "solid-js";
import Fade from "../components/Fade";
import { useTranslate } from "../utilities/i18n";
import ErrorText from "../components/ErrorText";
import { Button, Link, Input, Title, Box } from "@nextania/ui";
import { Switch as ConditionalSwitch } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { calculateEntropy, continueToRegisteredService } from "../utilities/client";
import { finishResetPassword, forgotPassword, RequestError, ForgotContinuation, hexToBytes, bytesToHex } from "@nextania/core-api";
import { RenderableError, RenderableErrorType } from "../utilities/errors";
import { useGlobalState, useUserStateOptionally } from "../context";

type ForgotStage = "email" | "sent" | "credentials" | "recovery" | "newrecovery" | "done" | "skip";
type InputError = "EMPTY_EMAIL" | "INVALID_EMAIL" | "EMPTY_PASSWORD" | "INVALID_CREDENTIALS" | "WEAK_PASSWORD" | "RECOVERY_KEY_INVALID";

const Forgot = () => {
    const [error, setError] = createSignal<RenderableErrorType | InputError>();
    const [stage, setStage] = createSignal<ForgotStage>("email");

    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [recoveryKeyInput, setRecoveryKeyInput] = createSignal("");
    const [continuation, setContinuation] = createSignal<ForgotContinuation>();
    const [newRecoveryKey, setNewRecoveryKey] = createSignal("");
    const [copied, setCopied] = createSignal(false);

    const [hiding, setHiding] = createSignal(false);
    
    const navigate = useNavigate();
    const t = useTranslate();
    const globalState = useGlobalState();
    const userState = useUserStateOptionally();

    const forgot = async () => {
        setError();
        try {
            if (stage() === "email") {
                if (!email().trim()) throw new RenderableError("EMPTY_EMAIL");
                // TODO:
                const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
                const match = email().trim().match(emailRegex);
                if (!match || match.length !== 1) throw new RenderableError("INVALID_EMAIL");
                globalState.setLoading(true);
                setEmail(match[0]);
                try {
                    await forgotPassword(email());
                    await switchStage("sent");
                    globalState.setLoading(false);
                } catch (e) {
                    console.error(e);
                    throw RenderableError.fromError(e as RequestError);
                }
            } else if (stage() === "credentials") {   
                if (password() !== confirmPassword()) throw new RenderableError("INVALID_CREDENTIALS");
                const entropy = calculateEntropy(password());
                if (entropy < 64) throw new RenderableError("WEAK_PASSWORD");
                const token = new URLSearchParams(location.search).get("token");
                globalState.setLoading(true);
                try {
                    const cont = await finishResetPassword(password(), token!);
                    setContinuation(() => cont);
                    await switchStage("recovery");
                    globalState.setLoading(false);
                } catch (e) {
                    console.error(e);
                    throw RenderableError.fromError(e as RequestError);
                }
            } else if (stage() === "recovery") {
                const raw = recoveryKeyInput().trim();
                let keyBytes = hexToBytes(raw); 
                if (!keyBytes || keyBytes.length !== 32) throw new RenderableError("RECOVERY_KEY_INVALID");
                globalState.setLoading(true);
                try {
                    const cont = continuation();
                    // FIXME:
                    if (!cont) throw new Error("No continuation");
                    const rotatedKey = await cont(keyBytes);
                    setNewRecoveryKey(bytesToHex(rotatedKey));
                    await switchStage("newrecovery");
                    globalState.setLoading(false);
                } catch (e) {
                    console.error(e);
                    throw RenderableError.fromError(e as RequestError);
                }
            }
        } catch (e) {
            globalState.setLoading(false);
            setError((e as RenderableError).render());
        }
    };

    const switchStage = async (stage: ForgotStage) => {
        globalState.setLoading(false);
        setHiding(true);
        await new Promise(r => setTimeout(r, 1000));
        setStage(stage);
        setHiding(false);
    };

    const login: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent> = (e) => {
        e.preventDefault();
        navigate("/login");
    };

    const copyNewRecoveryKey = () => {
        navigator.clipboard.writeText(newRecoveryKey()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const press = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            forgot();
        }
    };

    onMount(() => {
        if (userState) {
            setStage("skip");
            continueToRegisteredService(globalState.serverConfig.trustedServices, userState.session.token);
        }
        const search = new URLSearchParams(location.search).get("token");
        if (search) {
            setStage("credentials");
        }
    });

    return (
        <ConditionalSwitch fallback={<div />}>
            <Match when={stage() === "email"}>
                <Fade hiding={hiding()}>
                    <Title>{t("FORGOT")}</Title>
                    <div>
                        <Input
                            type="email"
                            placeholder={t("EMAIL")}
                            loading={globalState.loading()}
                            onKeyDown={press}
                            value={email()}
                            onChange={v => setEmail((v.target as HTMLInputElement).value)}
                        />
                        <Button onClick={forgot} disabled={globalState.loading()}>{t("CONTINUE")}</Button>
                    </div>
                    <p>
                        <Link href="/login" onClick={login}>{t("LOGIN")}</Link>
                    </p>
                    <ErrorText>
                        {error() && t(error()!)}
                    </ErrorText>
                </Fade>
            </Match>
            <Match when={stage() === "sent"}>
                <Fade hiding={hiding()}>
                    <Title>{t("FORGOT")}</Title>
                    <div>
                        <label>
                            If there is an account associated with that email address, we will send you an email with a link to continue the process.
                        </label>
                    </div>
                    <ErrorText />
                </Fade>
            </Match>
            <Match when={stage() === "credentials"}>
                <Fade hiding={hiding()}>
                    <Title>{t("FORGOT")}</Title>
                    <div>
                        <Input
                            placeholder={t("PASSWORD")}
                            loading={globalState.loading()}
                            onKeyDown={press}
                            value={password()}
                            onChange={v => setPassword((v.target as HTMLInputElement).value)}
                            type="password"
                        />
                        <Input
                            placeholder={t("CONFIRM_PASSWORD")}
                            loading={globalState.loading()}
                            onKeyDown={press}
                            value={confirmPassword()}
                            onChange={v => setConfirmPassword((v.target as HTMLInputElement).value)}
                            type="password"
                        />
                        <Button onClick={forgot} disabled={globalState.loading()}>{t("CONTINUE")}</Button>
                    </div>
                    <ErrorText>
                        {error() && t(error()!)}
                    </ErrorText>
                </Fade>
            </Match>
            <Match when={stage() === "recovery"}>
                <Fade hiding={hiding()}>
                    <Title>{t("FORGOT")}</Title>
                    <div>
                        <p>{t("RECOVERY_KEY_INPUT")}</p>
                        <Input
                            placeholder={t("RECOVERY_KEY_INPUT")}
                            loading={globalState.loading()}
                            onKeyDown={press}
                            value={recoveryKeyInput()}
                            onChange={v => setRecoveryKeyInput((v.target as HTMLInputElement).value)}
                        />
                        <Button onClick={forgot} disabled={globalState.loading()}>{t("CONTINUE")}</Button>
                    </div>
                    <ErrorText>
                        {error() && t(error()!)}
                    </ErrorText>
                </Fade>
            </Match>
            <Match when={stage() === "newrecovery"}>
                <Fade hiding={hiding()}>
                    <Title>{t("RECOVERY_KEY_NEW")}</Title>
                    <div>
                        <p>{t("RECOVERY_KEY_NEW_DESCRIPTION")}</p>
                        <Box type="warning">
                            <p>{t("RECOVERY_KEY_LABEL")}</p>
                            <code style={{ "word-break": "break-all", "font-size": "0.9em" }}>{newRecoveryKey()}</code>
                        </Box>
                        <Button onClick={copyNewRecoveryKey} disabled={globalState.loading()}>
                            {copied() ? t("RECOVERY_KEY_COPIED") : t("RECOVERY_KEY_COPY")}
                        </Button>
                        <Button onClick={() => navigate("/login")} disabled={globalState.loading()}>{t("LOGIN")}</Button>
                    </div>
                    <ErrorText />
                </Fade>
            </Match>
            <Match when={stage() === "done"}>
                <Fade hiding={hiding()}>
                    <Title>{t("FORGOT")}</Title>
                    <div>
                        <label>
                            Your password has been successfully reset.
                        </label>
                    </div>
                    <ErrorText />
                </Fade>
            </Match>
            <Match when={stage() === "skip"}>
                <Fade hiding={hiding()}>
                    <Title>{t("CONTINUE")}</Title>
                    <div>
                        <label>{t("ALREADY_LOGGED_IN")}</label>
                    </div>
                    <ErrorText />
                </Fade>
            </Match>
        </ConditionalSwitch>
    )
};

export default Forgot;
