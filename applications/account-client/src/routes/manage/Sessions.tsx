
import { Section } from "../ManageAccount";
import { Box, Button, Toggle, ToggleContainer } from "@nextania/ui";
import { decodeTime } from "ulid";
import { createMemo, createSignal, onMount } from "solid-js";
import { useGlobalState } from "../../context";
import { styled } from "solid-styled-components";
import { Session } from "@nextania/core-api";
import { useTranslate } from "../../utilities/i18n";

const SessionList = styled.table`
    
    & > thead > tr > th {
        border-bottom: 1px solid var(--secondary-light);
        padding-left: 8px;
        padding-right: 8px;
        white-space: nowrap;
        padding-bottom: 4px;
    }
    border-collapse: collapse;
    width: 100%;
    height: 100%;
`;

const SessionItems = styled.tbody`
    & > tr > td {
        padding-top: 4px;
        padding-bottom: 4px;
        padding-left: 8px;
        padding-right: 8px;
        white-space: nowrap;
    }
`;

const SessionListContainer = styled.div`
    margin-top: 20px;
    border-radius: 10px;
    border: 1px solid var(--secondary-a);
    background-color: var(--secondary-a);
    padding: 10px;
    overflow-x: auto;
`;

const Sessions = () => {
    const [ipLogging, setIpLogging] = createSignal<boolean>(false);
    const [sessions, setSessions] = createSignal<Session[]>([]);
    const state = createMemo(() => useGlobalState());
    const t = useTranslate();

    const toggleIp = (e: Event) => {
        // TODO: implement this
    };

    const logoutAll = () => {
        const session = state().get("session");
        if (!session) return console.error("No session found");
        session.logoutAll();
    };

    const revoke = (id: string) => {
        const session = state().get("session");
        if (!session) return console.error("No session found");
        session.logout(id).then(() => {
            const newSessions = sessions().filter(s => s.id !== id);
            setSessions(newSessions);
        }).catch(() => {
            console.error("Failed to revoke session");
        });
    }

    onMount(async () => {
        const session = state().get("session");
        if (!session) return console.error("No session found");
        const sessions = await session.getAllSessions();
        setSessions(sessions);
    });

    return (
        <>
            <h1>{t("SESSIONS")}</h1>
            <Section>
                <Box type="warning">
                    <p>
                        IP address logging is disabled by default. If you enable this feature, we will store the IP address of future active sessions. Disabling this feature will delete all such information.
                    </p>
                    <br />
                    <p>For now, this setting will have no effect as this feature is not yet implemented.</p>
                </Box>
                <ToggleContainer>
                <Toggle onChange={toggleIp} checked={ipLogging} setChecked={setIpLogging}  /> <span>Enable IP address logging</span></ToggleContainer>
            </Section>
            <Section>
                <Box type="error">
                    <p>
                        {t("LOGOUT_ALL_DESCRIPTION")}
                    </p>
                </Box>
                <Button onClick={logoutAll}>{t("LOGOUT_ALL")}</Button>
            </Section>
            <div>
            <SessionListContainer>
                <SessionList>
                    <thead>
                        <tr>
                            <th>{t("ID")}</th>
                            <th>{t("FRIENDLY_NAME")}</th>
                            <th>{t("CREATED_AT")}</th>
                            <th>IP address</th>
                            <th>{t("ACTIONS")}</th>
                        </tr>
                    </thead>
                    <SessionItems>
                        {sessions().map(session => (
                            <tr>
                                <td>{session.id}</td>
                                <td>{session.friendlyName}</td>
                                <td>{new Date(decodeTime(session.id)).toLocaleString(new Intl.Locale("zh-CN"))}</td>
                                <td>{session.ip}</td>
                                <td>
                                    <Button onClick={() => revoke(session.id)}>{t("REVOKE")}</Button>
                                </td>
                            </tr>
                        ))}
                    </SessionItems>
                </SessionList>
            </SessionListContainer>
            </div>
        </>
    );
};

export default Sessions;