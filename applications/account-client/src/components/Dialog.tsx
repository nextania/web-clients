import Dialog from "@corvu/dialog";
import { keyframes, styled } from "solid-styled-components";

const overlayIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

const overlayOut = keyframes`
    from { opacity: 1; }
    to   { opacity: 0; }
`;

const contentIn = keyframes`
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const contentOut = keyframes`
    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    to   { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
`;

export const Overlay = styled(Dialog.Overlay)`
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    &[data-open] {
        animation: ${overlayIn} 0.2s ease;
    }
    &[data-closed] {
        animation: ${overlayOut} 0.2s ease;
    }
`;

export const Content = styled(Dialog.Content)`
    position:fixed;
    left:50%;
    top:50%;
    z-index: 1001;
    transform: translate(-50%, -50%);
    background-color: var(--form-background-right);
    color: var(--foreground);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
     & > * + * {
        margin-top: 10px;
    }
    max-width: 1000px;
    &[data-open] {
        animation: ${contentIn} 0.2s ease;
    }
    &[data-closed] {
        animation: ${contentOut} 0.2s ease;
    }
`;
