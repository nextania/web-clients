import { Button, Input, Toggle, ToggleContainer, Box } from "@nextania/ui";
import { Section } from "../ManageAccount";
import { createEffect, createMemo, createSignal, onMount, Show } from "solid-js";
import { useGlobalState, useUserState } from "../../context";
import Mfa from "../../components/dialogs/Mfa";
import Dialog from "@corvu/dialog";
import { calculateEntropy } from "../../utilities";
import { useNavigate } from "@solidjs/router";
import Delete from "../../components/dialogs/Delete";
import { styled } from "solid-styled-components";
import { Passkey } from "@nextania/core-api";
import { useTranslate } from "../../i18n";

type DialogType = "DELETE" | "MFA" | "NONE";

const PasskeyList = styled.table`
    & > thead > tr > th {
        border-bottom: 1px solid var(--secondary-light);
    }
    border-collapse: collapse;
    width: 100%;
    height: 100%;
`;

const PasskeyItems = styled.tbody`
    & > tr > td {
        padding-top: 4px;
        padding-bottom: 4px;
    }
`;

const PasskeyListContainer = styled.div`
    margin-top: 20px;
    border-radius: 10px;
    border: 1px solid var(--secondary-a);
    background-color: var(--secondary-a);
    padding: 10px;
`;

const Account = () => {
    const [username, setUsername] = createSignal<string>();
    const [newPassword, setNewPassword] = createSignal<string>("");
    const [twoFactor, setTwoFactor] = createSignal<boolean>();
    const userState = useUserState();
    const dialogContext = createMemo(() => Dialog.useContext());
    const [dialogType, setDialogType] = createSignal<DialogType>();
    const navigate = useNavigate();
    const [passkeys, setPasskeys] = createSignal<Passkey[]>([]);
    const t = useTranslate();
    const globalState = useGlobalState();

    onMount(async () => {
        globalState.setLoading(true);
        const passkeys = await userState.session.getPasskeys();
        setPasskeys(passkeys);
        setTwoFactor(userState.settings.mfaEnabled);
        setUsername(userState.settings.username);
        globalState.setLoading(false);
    });

    createEffect(async () => {
        let mfa = twoFactor();
        if (mfa !== undefined && mfa !== userState.settings.mfaEnabled) {
            if (userState.settings.mfaEnabled === false && mfa === true) {
                // open setup dialog
                setDialogType("MFA");
                dialogContext().setOpen(true);
            } else {
                if (userState.session.isElevated()) {
                    try {
                        await userState.session.configureMfa();
                        userState.updateSettings({ mfaEnabled: false });
                    } catch(e) {
                        userState.updateSettings({ mfaEnabled: true });   
                    }
                }
            }
        }
    });

    
    createEffect(() => {
        if (!dialogContext().open()) {
            setTwoFactor(userState.settings.mfaEnabled);
            setDialogType("NONE");
        }
    });

    const updateAccount = async () => {
        let newUsername: string|undefined = username()?.trim();
        if (newUsername === userState.settings.username || !newUsername) newUsername = undefined;
        if (newUsername && !(/^[0-9A-Za-z_.-]{3,32}$/).test(newUsername)) {
            // TODO: show error
            return alert("Invalid username");
        }
        if (!newUsername) return; // no changes
        globalState.setLoading(true);
        if (userState.session.isElevated()) {
            try {
                await userState.session.commitAccountSettings({ username: newUsername });
            } catch {
                window.location.reload();
            }
        }
        globalState.setLoading(false);
    };

    const addPasskey = async () => {
        if (userState.session.isElevated()) {
            try {
                await userState.session.createPasskey();
            } catch(e) {
                console.error(e);
                window.location.reload();
            }
        }
    };

    const updatePassword = async () => {
        let newPasswordUnwrap: string | undefined = newPassword();
        if (!newPasswordUnwrap) newPasswordUnwrap = undefined;
        if (calculateEntropy(newPasswordUnwrap) < 64) {
            // TODO: show error
            return alert("Password is too weak");
        }
        if (!newPasswordUnwrap) return; // no changes
        globalState.setLoading(true);
        if (userState.session.isElevated()) {
            try {
                await userState.session.updatePassword(newPasswordUnwrap);
            } catch {
                window.location.reload();
            }
        }
        globalState.setLoading(false);
    }

    const deleteAccount = () => {
        setDialogType("DELETE");
        dialogContext().setOpen(true);
    };
    const deletePasskey = async (id: string) => {
        globalState.setLoading(true);
        if (userState.session.isElevated()) {
            try {
                await userState.session.deletePasskey(id);
                const passkeys = await userState.session.getPasskeys();
                setPasskeys(passkeys);
            } catch {
                window.location.reload();
            }
        }
        globalState.setLoading(false);
    };

    const disabled = globalState.loading() || dialogContext().open() || !userState.session.isElevated();

    return (
        <>
        
            <h1>{t("MANAGE_ACCOUNT")}</h1>
            <Show when={!userState.session.isElevated()}>
                <Section>
                    <Box type="error">
                        <div>
                            <h2>{t("ESCALATION_REQUIRED")}</h2>
                            <p>
                                {t("ESCALATION_REQUIRED_DESCRIPTION")}
                            </p>
                        </div>
                        <Button onClick={() => {
                            navigate("/escalate");
                        }}>{t("CONTINUE")}</Button>
                    </Box>
                </Section>
            </Show>

            <Section>
                <Input placeholder={t("USERNAME")} loading={disabled} value={username()} onChange={e => setUsername((e.target as HTMLInputElement).value)} />
                <Button onClick={updateAccount}  disabled={disabled}>{t("UPDATE_ACCOUNT")}</Button>
                    
            </Section>
            <Section>
                <Input placeholder={t("NEW_PASSWORD")} loading={disabled} type="password" value={newPassword()} onChange={e => setNewPassword((e.target as HTMLInputElement).value)} />
                <Button onClick={updatePassword}  disabled={disabled}>{t("UPDATE_PASSWORD")}</Button>
            </Section>
            <Section>
                <Box type="warning">
                    {t("MFA_DESCRIPTION")}
                </Box>
                <ToggleContainer>
                    <Toggle checked={twoFactor} setChecked={setTwoFactor} disabled={disabled} />
                    <span>{t("MFA")}</span>
                </ToggleContainer>
            </Section>
            <Section>
                <Box type="information">
                    <h2>{t("PASSKEYS")}</h2>
                    <p>
                        {t("PASSKEYS_DESCRIPTION")}
                    </p>
                </Box>
                <Button onClick={addPasskey} disabled={disabled}>{t("PASSKEYS_ADD")}</Button>
                <PasskeyListContainer>
                    <PasskeyList>
                        <thead>
                            <tr>
                                <th>{t("ID")}</th>
                                <th>{t("FRIENDLY_NAME")}</th>
                                <th>{t("ACTIONS")}</th>
                            </tr>
                        </thead>
                        <PasskeyItems>
                            {passkeys().map(p => (
                                <tr>
                                    <td>{p.id}</td>
                                    <td>{p.friendlyName}</td>
                                    <td>
                                        <Button onClick={() => deletePasskey(p.id)} disabled={disabled}>{t("PASSKEYS_DELETE")}</Button>
                                    </td>
                                </tr>
                            ))}
                        </PasskeyItems>
                    </PasskeyList>
                </PasskeyListContainer>
            </Section>
            <Section>
                <Box type="error">
                    <h2>{t("DANGER_ZONE")}</h2>
                    <p>
                        {t("DELETE_ACCOUNT_DESCRIPTION")}
                    </p>
                </Box>
                <Button onClick={deleteAccount} disabled={disabled}>{t("DELETE_ACCOUNT")}</Button>
            </Section>
            <Show when={dialogType() === "DELETE"}>
                <Delete />
            </Show>
            <Show when={dialogType() === "MFA"}>
                <Mfa />
            </Show>
        </>
    )
};

export default Account;