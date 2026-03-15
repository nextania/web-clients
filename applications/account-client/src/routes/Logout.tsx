import { onMount, Show } from "solid-js";
import Fade from "../components/Fade";
import { Title } from "@nextania/ui";
import { useTranslate } from "../i18n";
import { useUserStateOptionally } from "../context";

const Logout = () => {
    const userState = useUserStateOptionally();
    const t = useTranslate();

    onMount(async () => {
        userState?.session.logout();
        localStorage.removeItem("token");
        localStorage.removeItem("escalationToken");
        localStorage.removeItem("keyB");
        sessionStorage.removeItem("keyB");
    });

    return (
        <Fade hiding={false}>
            <Show when={userState} fallback={
                <>
                    <Title>{t("LOGGED_OUT")}</Title>
                    <p>{t("LOGGED_OUT_NOT_LOGGED_IN")}</p>
                </>
            }>
                <Title>{t("LOGGED_OUT")}</Title>
                <p>{t("LOGGED_OUT_SUCCESS")}</p>
            </Show>
        </Fade>
    )
};
export default Logout;
