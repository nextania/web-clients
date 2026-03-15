import HCaptcha from "solid-hcaptcha";
import { Button, Input, Title, Box, Link, OtpInput } from "@nextania/ui";
import Fade from "../components/Fade";
import ErrorText from "../components/ErrorText";
import { styled } from "solid-styled-components";
import { useTranslate } from "../utilities/i18n";
import { createEffect, createSignal, Match, onMount, Show, Switch } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { calculateEntropy, continueToRegisteredService, getBrowser } from "../utilities/client";
import { createAccount, RegistrationContinuation, RequestError, bytesToHex, encode } from "@nextania/core-api";
import { useGlobalState, useUserStateOptionally } from "../context";
import { RenderableError, RenderableErrorType } from "../utilities/errors";
const ButtonContainer = styled.div`
    & > :not([hidden]) ~ :not([hidden]) {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }
`;

type RegisterStage = "disabled" | "credentials" | "verify" | "recovery" | "done" | "skip";
type PendingState = { token: string, keyB: Uint8Array };

const Register = () => {
    const [error, setError] = createSignal<RenderableErrorType>();
    const [stage, setStage] = createSignal<RegisterStage>("credentials");
    const [username, setUsername] = createSignal("");
    const [displayName, setDisplayName] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [captchaToken, setCaptchaToken] = createSignal("");
    const [hiding, setHiding] = createSignal(false);
    const [continuation, setContinuation] = createSignal<RegistrationContinuation>();
    const [code, setCode] = createSignal("");
    const [recoveryKey, setRecoveryKey] = createSignal("");
    const [pendingState, setPendingState] = createSignal<PendingState>();
    const [copied, setCopied] = createSignal(false);
    const userState = useUserStateOptionally();
    const t = useTranslate();
    const state = useGlobalState();

    createEffect(() => {
        if (state.serverConfig.registrationDisabled) {
            setStage("disabled");
        }
    });

    let captcha: HCaptcha | undefined;

    const navigate = useNavigate();

    const register = async () => {
        setError();
        state.setLoading(true);
        try {
            if (stage() === "credentials") {
                if (!email().trim()) throw new RenderableError("EMPTY_EMAIL");
                const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
                const match = email().trim().match(emailRegex);
                if (!match || match.length !== 1) throw new RenderableError("INVALID_EMAIL");
                setEmail(match[0]);
                try {
                    const session = await createAccount(email().trim(), captchaToken());
                    setContinuation(session);
                    state.setLoading(false);
                    setHiding(true);
                    await new Promise(r => setTimeout(r, 1000));
                    setStage("verify");
                    setHiding(false);
                } catch (e) {
                    console.error(e);
                    throw RenderableError.fromError(e as RequestError);
                }
            } else if (stage() === "verify") {
                const c = continuation();
                if (!c) {
                    state.setLoading(false);
                    throw new Error("Continuation is not set");
                }
                const entropy = calculateEntropy(password());
                if (entropy < 64) throw new RenderableError("WEAK_PASSWORD");
                if (!displayName().trim()) throw new RenderableError("EMPTY_DISPLAY_NAME");
                if (!username().trim()) throw new RenderableError("EMPTY_USERNAME");
                if (displayName().trim().length > 64) throw new RenderableError("LONG_DISPLAY_NAME");
                if (!(/^[0-9A-Za-z_.-]{3,32}$/).test(username().trim())) throw new RenderableError("INVALID_USERNAME");
                if (c.emailEnabled) {
                    if (!code().trim()) throw new RenderableError("INVALID_CODE");
                    if (code().trim().length !== 8) throw new RenderableError("INVALID_CODE");
                }
                try {
                    const result = await c.continue(username().trim(), password(), displayName().trim(), code().trim(), getBrowser());
                    setRecoveryKey(bytesToHex(result.recoveryKey));
                    setPendingState({ token: result.client.token, keyB: result.client.keyB });
                    state.setLoading(false);
                    setHiding(true);
                    await new Promise(r => setTimeout(r, 1000));
                    setStage("recovery");
                    setHiding(false);
                } catch (e) {
                    console.error(e);
                    throw RenderableError.fromError(e as RequestError);
                }
            }
        } catch (e) {
            state.setLoading(false);
            setError((e as RenderableError).render());
        }
    };



    const confirmRecovery = async () => {
        const pending = pendingState();
        // FIXME:
        if (!pending) throw new Error("Pending state is not set");
        localStorage.setItem("token", pending.token);
        sessionStorage.setItem("keyB", encode(pending.keyB));
        setHiding(true);
        await new Promise(r => setTimeout(r, 1000));
        setStage("done");
        setHiding(false);
        continueToRegisteredService(state.serverConfig.trustedServices, pending.token);
    };

    const copyRecoveryKey = () => {
        navigator.clipboard.writeText(recoveryKey()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    const press = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            register();
        }
    };
    const login = () => {
        const continueUrl = new URLSearchParams(window.location.search).get("continue");
        const href = continueUrl ? `/login?continue=${encodeURIComponent(continueUrl)}` : "/login";
        navigate(href);
    };
    const back = async () => {
        state.setLoading(false);
        setHiding(true);
        await new Promise(r => setTimeout(r, 1000));
        setStage("credentials");
        setHiding(false);
    };
    const initCaptcha = () => {
        captcha?.execute();
    };

    onMount(() => {
        if (userState) {
            setStage("skip");
            continueToRegisteredService(state.serverConfig.trustedServices, userState.session.token);
        }
    });

    return (
        <Switch>
            <Match when={stage() === "disabled"}>
                <Fade hiding={hiding()}>
                    <Title>{t("REGISTER")}</Title>
                    <div>
                        <p>{t("REGISTRATION_DISABLED")}</p>
                    </div>
                    <ErrorText />
                </Fade>
            </Match>
            <Match when={stage() === "credentials"}>
                <Fade hiding={hiding()}>
                    <Title>{t("REGISTER")}</Title>
                    <div>
                        <Input
                            type="email"
                            placeholder={t("EMAIL")}
                            loading={state.loading()}
                            onKeyDown={press}
                            value={email()}
                            onChange={v => setEmail((v.target as HTMLInputElement).value)}
                        />
                        <Box type="success">
                            <p>{t("VERIFICATION_DESCRIPTION")}</p>
                        </Box>
                        <Box type="information">
                            <HCaptcha 
                                languageOverride={state.language()}
                                theme="light"
                                sitekey={state.serverConfig.captchaKey}
                                onVerify={setCaptchaToken}
                                ref={captcha}
                                onLoad={initCaptcha}
                            />
                        </Box>
                        <Button onClick={register} disabled={state.loading()}>{t("CONTINUE")}</Button>
                    </div>
                    <p>
                        {t("HAVE_AN_ACCOUNT")} <Link href="javascript:void(0)" onClick={login}>{t("LOGIN")}</Link>
                    </p>
                    <ErrorText>
                        {error() && t(error()!)}
                    </ErrorText>
                </Fade>
            </Match>
            <Match when={stage() === "verify"}>
                <Fade hiding={hiding()}>
                    <Title>{t("VERIFICATION")}</Title>
                    <div>
                        <Show when={continuation()?.emailEnabled}>
                            {/* <label>{translate(lang(), "EMAIL_SENT")}</label> */}
                            <OtpInput code={code} setCode={setCode} />
                        </Show>
                        <Input
                            placeholder={t("DISPLAY_NAME")}
                            loading={state.loading()}
                            onKeyDown={press}
                            value={displayName()}
                            onChange={v => setDisplayName((v.target as HTMLInputElement).value)}
                        />
                        <Input
                            placeholder={t("USERNAME")}
                            loading={state.loading()}
                            onKeyDown={press}
                            value={username()}
                            onChange={v => setUsername((v.target as HTMLInputElement).value)}
                        />
                        <Input 
                            type="password"
                            placeholder={t("PASSWORD")} 
                            loading={state.loading()} 
                            onKeyDown={press} 
                            value={password()} 
                            onChange={v => setPassword((v.target as HTMLInputElement).value)} 
                        />
                        <ButtonContainer>
                            <Button onClick={back} disabled={state.loading()}>{t("BACK")}</Button>
                            <Button onClick={register} disabled={state.loading()}>{t("CONTINUE")}</Button>
                        </ButtonContainer>
                    </div>
                    <ErrorText>
                    {error() && t(error()!)}
                    </ErrorText>
                </Fade>
            </Match>
            <Match when={stage() === "recovery"}>
                <Fade hiding={hiding()}>
                    <Title>{t("RECOVERY_KEY_BACKUP")}</Title>
                    <div>
                        <p>{t("RECOVERY_KEY_BACKUP_DESCRIPTION")}</p>
                        <Box type="warning">
                            <p>{t("RECOVERY_KEY_LABEL")}</p>
                            <code style={{ "word-break": "break-all", "font-size": "0.9em" }}>{recoveryKey()}</code>
                        </Box>
                        <Button onClick={copyRecoveryKey} disabled={state.loading()}>
                            {copied() ? t("RECOVERY_KEY_COPIED") : t("RECOVERY_KEY_COPY")}
                        </Button>
                        <Button onClick={confirmRecovery} disabled={state.loading()}>{t("RECOVERY_KEY_CONFIRM")}</Button>
                    </div>
                    <ErrorText />
                </Fade>
            </Match>
            <Match when={stage() === "done"}>
                <Fade hiding={hiding()}>
                    <Title>{t("CONTINUE")}</Title>
                    <div>
                        <label>{t("LOGGED_IN")}</label>
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
        </Switch>
    );
};

export default Register;
