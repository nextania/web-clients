import { createResource, Match, ParentProps, Show, Switch } from "solid-js";
import { Navigate } from "@solidjs/router";
import { UserStateProvider } from "../context";
import { validateSession, decode } from "@nextania/core-api";

const Authenticated = (props: ParentProps<{ noRedirect?: boolean }>) => {
    const [client] = createResource(async () => {
        const token = localStorage.getItem("token");
        const escalationToken = localStorage.getItem("escalationToken");
        if (token) {
            try {
                const storedKeyB = localStorage.getItem("keyB") ?? sessionStorage.getItem("keyB");
                if (!storedKeyB) throw new Error("KEY_UNAVAILABLE");
                const keyB = decode(storedKeyB);
                const session = await validateSession(token, keyB, escalationToken || undefined);
                const user = await session.getSettings();
                return [session, user, keyB] as const;
            } catch {}
        }
    });

    return (
        <Show when={!client.loading}>
            <Switch>
                <Match when={!client() && !props.noRedirect}>
                    <Navigate href={`/login?continue=${encodeURIComponent(location.href)}`} />
                </Match>
                <Match when={!!client()}>
                    <UserStateProvider session={client()![0]} initialSettings={client()![1]} keyB={client()![2]}>
                        {props.children}
                    </UserStateProvider>
                </Match>
                <Match when={props.noRedirect && !client()}>
                    {props.children}
                </Match>
            </Switch>
        </Show>
    )
};

export default Authenticated;
