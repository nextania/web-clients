import { styled } from "solid-styled-components";
import { Input, Button } from "@nextania/ui";
import { Section } from "../ManageAccount";
import AvatarPicker from "../../components/AvatarPicker";
import { createMemo, createSignal, onMount } from "solid-js";
import Dialog from "@corvu/dialog";
import { useGlobalState, useUserState } from "../../context";
import { useTranslate } from "../../utilities/i18n";

const AvatarContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    width: 100px;
    height: 100px;
    border-radius: 10px;
    background-color: var(--secondary-a);
`;

export interface Image {
    file: File,
    url: string,
}

const AvatarConfigurator = styled.div`
display:flex;
flex-direction:column;
& > * + * {
    margin-top: 10px;
}
`;


const Profile = () => {
    const [stagedImage, setStagedImage] = createSignal<Image>();
    const dialogContext = createMemo(() => Dialog.useContext());
    const [displayName, setDisplayName] = createSignal<string>();
    const [description, setDescription] = createSignal<string>();
    const t = useTranslate();
    const userState = useUserState();
    const globalState = useGlobalState();
    const handleAvatarChange = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.addEventListener("change", e => {
            const file = (e.target as HTMLInputElement).files?.item(0);
            if (file) {
                const reader = new FileReader();
                reader.addEventListener("load", e => {
                    const result = e.target?.result;
                    setStagedImage({
                        file,
                        url: result as string,
                    });
                    dialogContext().setOpen(true);
                });
                reader.readAsDataURL(file);
            }
        })
        input.click(); 
    };

    onMount(async () => {
        globalState.setLoading(true);
        setDisplayName(userState.settings.displayName);
        setDescription(userState.settings.description);
        globalState.setLoading(false);
    });

    const save = () => {
        let dn = displayName()?.trim();
        let desc = description()?.trim();
        if (userState.settings.displayName === dn && userState.settings.description === desc) return;
        if (!dn) return;
        if (dn.length > 64) { // TODO: errors
            return;
        }
        // 256 for now, but 2048 server side
        if (desc && desc.length > 256) { // TODO: make this a constant
            return;
        }
        userState.session.commitProfile({
            displayName: displayName(),
            description: description(),
        });
        userState.updateSettings({
            displayName: displayName(),
            description: description(),
        });
    };
    
    return (
        <>
            <h1>{t("PROFILE")}</h1>
            <Section>
                <AvatarConfigurator>
                    <AvatarContainer onClick={handleAvatarChange}>
                        <img src={`${globalState.serverConfig.cdnRoot}/assets/default.png`} alt="avatar" />
                    </AvatarContainer>
                    <Button>{t("REMOVE_AVATAR")}</Button>
                </AvatarConfigurator>
            </Section>
            <Section>
                <Input placeholder={t("DISPLAY_NAME")} loading={globalState.loading()} value={displayName()} onChange={e => setDisplayName((e.target as HTMLInputElement).value)}  />
                <Input placeholder={t("PROFILE_DESCRIPTION")} loading={globalState.loading()} value={description()} onChange={e => setDescription((e.target as HTMLInputElement).value)}  />
                <Button onClick={save} disabled={globalState.loading()}>{t("SAVE")}</Button>
            </Section>
            <AvatarPicker stagedImage={stagedImage} />
        </>
    )
};

export default Profile;