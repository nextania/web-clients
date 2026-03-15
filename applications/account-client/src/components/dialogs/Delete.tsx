import Dialog from "@corvu/dialog";
import { Content, Overlay } from "../Dialog";
import { createMemo, createSignal, Show } from "solid-js";
import { Button, Box } from "@nextania/ui";
import { useGlobalState, useUserState } from "../../context";
import { useNavigate } from "@solidjs/router";
import { useTranslate } from "../../i18n";
import { RenderableError, RenderableErrorType } from "../../errors";
import { RequestError } from "@nextania/core-api";

const Delete = () => {
    const [error, setError] = createSignal<RenderableErrorType>();
    const dialogContext = createMemo(() => Dialog.useContext());
    const navigate = useNavigate();
    const t = useTranslate();
    const globalState = useGlobalState();
    const userState = useUserState();
    
    const next = async () => {
        if (error()) setError(undefined);
        globalState.setLoading(true);
        if (!userState.session.isElevated()) return console.error("Session should be elevated");
        try {
            await userState.session.deleteAccount();
            navigate("/login");
        } catch (e) {
            const error = RenderableError.fromError(e as RequestError).render();
            setError(error);
        }
        globalState.setLoading(false);
    };

    const closeDialog = () => dialogContext().setOpen(false);

    return (
        <>
            <Dialog.Portal>
                <Overlay />
                <Content>
                    <h1>{t("CONFIRM_DELETION")}</h1>
                    <p>{t("CONFIRM_DELETION_DESCRIPTION")}</p>
                    <p>{t("CONFIRM_DELETION_WARNING")}</p>
                    <Box type="error">
                        <h1>{t("CONFIRM_DELETION_LAST_WARNING")}</h1>
                    </Box>
                    <Show when={error() !== undefined}>
                        <Box type="error">
                            {t(error()!)}
                        </Box>
                    </Show>
                    <Button onClick={next} disabled={globalState.loading()}>{t("CONTINUE")}</Button>
                    <Button onClick={closeDialog} disabled={globalState.loading()}>{t("CANCEL")}</Button>
                </Content>
            </Dialog.Portal>
        </>
    )
};

export default Delete;