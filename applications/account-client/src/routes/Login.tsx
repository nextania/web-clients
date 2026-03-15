import { createSignal, JSX, Match, onMount, Show } from "solid-js";
import Fade from "../components/Fade";
import { useTranslate } from "../utilities/i18n";
import ErrorText from "../components/ErrorText";
import { Button, Link, OtpInput, Input, Title, Toggle, ToggleContainer } from "@nextania/ui";
import { Switch as Switch } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { styled } from "solid-styled-components";
import { createSession, PartialClient, createSessionPasskey, RequestError, encode } from "@nextania/core-api";
import { useGlobalState, useUserStateOptionally } from "../context";
import { RenderableError, RenderableErrorType } from "../utilities/errors";
import { continueToRegisteredService, getBrowser } from "../utilities/client";

type LoginStage = "credentials" | "2fa" | "done" | "skip";

const LoginOr = styled.div`
    display: flex;
    align-items: center;
    align-self: center;
    width: 100%;
`

const Login = ({ escalate }: { escalate?: boolean; }) => {
    const [error, setError] = createSignal<RenderableErrorType>();
    const [stage, setStage] = createSignal<LoginStage>("credentials");

    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [code, setCode] = createSignal("");
    const [persist, setPersist] = createSignal(false);
    const [partialSession, setPartialSession] = createSignal<PartialClient>();

    const [hiding, setHiding] = createSignal(false);

    const navigate = useNavigate();
    const state = useGlobalState();
    const userState = useUserStateOptionally();
    const t = useTranslate();

    const login = async () => {
        setError();
        try {
            if (stage() === "credentials") {
                if (!email().trim()) throw new RenderableError("EMPTY_EMAIL");
                // TODO:
                const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
                const match = email().trim().match(emailRegex);
                if (!match || match.length !== 1) throw new RenderableError("INVALID_EMAIL");
                if (!password().trim()) throw new RenderableError("EMPTY_PASSWORD");
                state.setLoading(true);
                setEmail(match[0]);
                try {
                    const session = await createSession(email().trim(), password(), escalate ? userState!.session.token : undefined, persist(), getBrowser());
                    if (session.needsContinuation()) {
                        setPartialSession(session);
                        await switchStage("2fa");
                    } else {
                        if (!escalate) {
                            (persist() ? localStorage : sessionStorage).setItem("keyB", encode(session.keyB));
                        }
                        await switchStage("done");
                        if (escalate) {
                            localStorage.setItem("escalationToken", session.token);
                            navigate("/manage");
                        } else {
                            localStorage.setItem("token", session.token);
                            continueToRegisteredService(state.serverConfig.trustedServices, session.token);
                        }
                    }
                } catch (e) {
                    console.error(e);
                    throw RenderableError.fromError(e as RequestError);
                }
            } else if (stage() === "2fa") {
                if (!code()) throw new RenderableError("EMPTY_CODE");
                if (code().length !== 8) throw new RenderableError("INVALID_CODE");
                state.setLoading(true);
                try {
                    const session = await partialSession()!.continue(code());
                    if (!escalate) {
                        (persist() ? localStorage : sessionStorage).setItem("keyB", encode(session.keyB));
                    }
                    await switchStage("done");
                    if (escalate) {
                        localStorage.setItem("escalationToken", session.token);
                        navigate("/manage");
                    } else {
                        localStorage.setItem("token", session.token);
                        continueToRegisteredService(state.serverConfig.trustedServices, session.token);
                    }
                } catch (e) {
                    console.error(e);
                    const error = e as RequestError;
                    throw error === "INVALID_CREDENTIALS" ? "INVALID_CODE" : RenderableError.fromError(error);
                }
            }
        } catch (e) {
            state.setLoading(false);
            setError((e as RenderableError).render());
        }
    };

    const switchStage = async (stage: LoginStage) => {
        state.setLoading(false);
        setHiding(true);
        await new Promise(r => setTimeout(r, 1000));
        setStage(stage);
        setHiding(false);
    };

    const register: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent> = (e) => {
        e.preventDefault();
        const continueUrl = new URLSearchParams(window.location.search).get("continue");
        const href = continueUrl ? `/register?continue=${encodeURIComponent(continueUrl)}` : "/register";
        navigate(href);
    };
    const forgot: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent> = (e) => {
        e.preventDefault();
        navigate("/forgot");
    };

    const press = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            login();
        }
    };

    onMount(() => {
        if (!escalate && userState) {
            setStage("skip");
            continueToRegisteredService(state.serverConfig.trustedServices, userState.session.token);
        } else if (escalate) {
            setEmail(userState!.settings.email);
        }
    });

    const loginPasskey = async () => {
        state.setLoading(true);
        const session = await createSessionPasskey(escalate ? userState!.session.token : undefined);
        if (session) {
            if (!escalate) {
                (persist() ? localStorage : sessionStorage).setItem("keyB", encode(session.keyB));
            }
            await switchStage("done");
            if (escalate) {
                localStorage.setItem("escalationToken", session.token);
                navigate("/manage");
            } else {
                localStorage.setItem("token", session.token);
                continueToRegisteredService(state.serverConfig.trustedServices, session.token);
            }
        } else {
            state.setLoading(false);
        }
    };
                
    return (
        <Switch fallback={<div />}>
            <Match when={stage() === "credentials"}>
                <Fade hiding={hiding()}>
                    <Show when={escalate}>
                        <Title>{t("ESCALATE")}</Title>
                    </Show>
                    <Show when={!escalate}>
                        <Title>{t("LOGIN")}</Title>
                    </Show>
                    <div>
                        <Button onClick={loginPasskey} disabled={state.loading()}>{t("LOGIN_WITH_PASSKEY")}</Button>
                    </div>
                    <LoginOr>
                        <hr style={{ "width": "100%", "border-radius": "1px" }} />
                        <span style={{ "padding-left": "10px", "padding-right": "10px" }}>{t("OR")}</span>
                        <hr style={{ "width": "100%", "border-radius": "1px" }} />
                    </LoginOr>
                    <div>
                        <Input
                            type="email"
                            placeholder={t("EMAIL")}
                            loading={escalate || state.loading()}
                            onKeyDown={press}
                            value={email()}
                            onChange={v => {
                                if (!escalate) setEmail((v.target as HTMLInputElement).value);
                            }}
                            autocomplete="email"
                            required
                        />
                        
                        <Input 
                            type="password"
                            placeholder={t("PASSWORD")} 
                            loading={state.loading()} 
                            onKeyDown={press} 
                            value={password()} 
                            onChange={v => setPassword((v.target as HTMLInputElement).value)}
                            autocomplete="current-password"
                            required
                        />
                        <Show when={!escalate}> 
                            <ToggleContainer>
                                <Toggle checked={persist} setChecked={setPersist} aria-label={t("STAY_SIGNED_IN")} />
                                <span>{t("STAY_SIGNED_IN")}</span>
                            </ToggleContainer>
                        </Show>
                        
                        <Button onClick={login} disabled={state.loading()}>{t("CONTINUE")}</Button>
                    </div>
                    <Show when={!escalate}>
                        <p>
                            {t("NO_ACCOUNT")} <Link href="/register" onClick={register}>{t("REGISTER")}</Link>
                            </p><p>
                            <Link href="/forgot" onClick={forgot}>{t("FORGOT")}</Link>
                        </p>
                    </Show>
                    <ErrorText>
                        {error() && t(error()!)}
                    </ErrorText>
                </Fade>
            </Match>
            <Match when={stage() === "2fa"}>
                <Fade hiding={hiding()}>
                    <Title>{t("MFA")}</Title>
                    <div>
                        {/* TODO: */}
                        <label>{t("ENTER_CODE")}</label> 
                        <OtpInput code={code} setCode={setCode} />
                        <Button onClick={login} disabled={state.loading()}>{t("CONTINUE")}</Button>
                    </div>
                    <ErrorText>
                        {error() && t(error()!)}
                    </ErrorText>
                </Fade>
            </Match>
            <Match when={stage() === "done"}>
                <Fade hiding={hiding()}>
                    <Title>{t("CONTINUE")}</Title>
                    <div>
                        <label>
                            {t("LOGGED_IN")}
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
        </Switch>
    )
};

export default Login;
