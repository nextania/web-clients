import Dialog from "@corvu/dialog";
import { Accessor, createMemo } from "solid-js";
import { styled } from "solid-styled-components";
import { Button } from "@nextania/ui";
import { CDN } from "@nextania/core-api";
import { Image } from "../routes/manage/Profile";
import { Content, Overlay } from "./Dialog";
import { useGlobalState } from "../context";

const StagedImage = styled.img`
    width: 200px;
    height: 200px;
    border-radius: 10px;
    object-fit: cover;
`;


const AvatarPicker = (props: { stagedImage: Accessor<Image | undefined>; }) => {
    const dialogContext = createMemo(() => Dialog.useContext());
    const globalState = useGlobalState();
    const closeDialog = () => {
        dialogContext().setOpen(false);
    };

    const save = () => {
        dialogContext().setOpen(false);
        // Save the image
        CDN.uploadAvatar(globalState.serverConfig.cdnRoot, props.stagedImage()!.file);
    }

    return (
        <Dialog.Portal>
            <Overlay />
            <Content>
                <h1>Avatar Picker</h1>
                <StagedImage src={props.stagedImage()?.url} alt="staged avatar" />
                <Button onClick={save}>Save</Button>
                <Button onClick={closeDialog}>Cancel</Button>
            </Content>
        </Dialog.Portal>
    );
};
export default AvatarPicker;