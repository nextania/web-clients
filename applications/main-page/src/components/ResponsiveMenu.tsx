import { Show } from "solid-js";
import { styled } from "solid-styled-components";
import Wordmark, { LogoBase, LogoContainer } from "./Logo";
import logo from "/logo.svg";
import { useNavigate } from "@solidjs/router";
import { AiOutlineClose } from "solid-icons/ai";
import { useStore } from "../state";

const MenuContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    z-index: 2000;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 10px;
    padding-bottom: 10px;
`;

const MenuItemList = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const MenuItem = styled.div`
    padding: 1rem;
    font-size: 1.5rem;
    user-select: none;
    cursor: default;
`;

const CloseContainer = styled.div`
    font-size: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
`;


const ResponsiveMenu = () => {
    const n = useNavigate();
    const store = useStore();

    const close = () => store.set("responsiveMenuOpen", false);

    const nx = (path: string) => {
        n(path);
        close();
    };
    
    const login = () => {
        // TODO:
        location.href = "https://account.nextania.com/login?continue=" + encodeURIComponent("https://account.nextania.com/authenticate");
    };

    const account = () => {
        location.href = "https://account.nextania.com/manage";
    };

    return (
        <Show when={store.get("responsiveMenuOpen")}>
            <MenuContainer>
                <TopBar>
                    <LogoContainer onClick={() => n("/")}> <LogoBase src={logo} /> <Wordmark /></LogoContainer>
                    <CloseContainer>
                        <AiOutlineClose onClick={close} />
                    </CloseContainer>
                </TopBar>
                <MenuItemList>
                    <MenuItem onClick={() => nx("/")}>Home</MenuItem>
                    <MenuItem onClick={() => nx("/about")}>About us</MenuItem>
                    <MenuItem onClick={() => nx("/services")}>Services</MenuItem>
                    <MenuItem onClick={() => nx("/resources")}>Resources</MenuItem>
                    <Show when={store.get("user")} fallback={
                        <MenuItem onClick={login}>Login</MenuItem>
                    }>
                        <MenuItem onClick={account}>Account</MenuItem>
                    </Show>
                </MenuItemList>
            </MenuContainer>

        </Show>
    )
};

export default ResponsiveMenu;
