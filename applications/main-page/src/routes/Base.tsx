import { A, useNavigate, useParams } from "@solidjs/router";
import Home from "./Home";
import { createEffect, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import { styled } from "solid-styled-components";
import Wordmark, { LogoBase, LogoContainer } from "../components/Logo";
import { Button } from "@nextania/ui";
import { RiLogosGithubFill, RiSystemMenuFill } from "solid-icons/ri";
import { BsGlobe } from "solid-icons/bs";
import About from "./About";
import Resources from "./Resources";
import Services from "./Services";
import { saveUser, useStore } from "../state";

const Header = styled.div`
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    background-color: rgba(16,0,28, 0.6);
    color: white;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 20px;
    padding-right: 20px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 1000;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const AccountContainer = styled.div`
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
    justify-content: flex-end;
`;


const HeaderRouteList = styled.div`
    display: flex;
    & > * + * {
        margin-left: 20px;
    }
`;

const HeaderRoute = styled.div`
    cursor: default;
    user-select: none;
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 5px;
    position: relative;
    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    ${(props: { active?: boolean }) => props.active ? `
        &::after {
            content: "";
            display: block;
            width: 75%;
            margin-left: 12.5%;
            height: 3px;
            background-color: var(--secondary);
            border-radius: 5px;
            margin-top: 5px;
            transition: width 0.3s, margin-left 0.3s;
        }
        &:hover::after {
            width: 100%;
            margin-left: 0;
        }
    ` : ""}
`;

const DropdownContainer = styled.div`
    position: relative;
    
    &:hover > div {
        opacity: 1;
        visibility: visible;
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 5px;
    background-color: rgba(16, 0, 28, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    min-width: 200px;
    padding: 10px 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s, visibility 0.2s;
    z-index: 1001;
`;

const DropdownItem = styled.div`
    padding: 10px 20px;
    cursor: pointer;
    user-select: none;
    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
`;

const Content = styled.div`
    height: auto;
`;

const Footer = styled.div`
    background-color: var(--secondary);
`

const FooterBody = styled.div`
    padding: 30px;
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
`;

const FooterFooter = styled.div`
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
`;

const FooterControls = styled.div`
    display: flex;
    & > * + * {
        margin-left: 10px;
    }
`;

const FooterControl = styled.div`
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    align-items: center;
    & > * + * {
        margin-left: 8px;
    }
    cursor: default;
    user-select: none;
`;

const Circle = styled.div`
    width: 10px;
    height: 10px;
    background-color: #00db00;
    border-radius: 50%;
`;

const FooterHeader = styled.div`
    display: flex;
    padding: 15px;
    justify-content: center;
    align-items: center;
    & > * + * {
        margin-left: 40px;
    }
    background-color: rgba(0, 0, 0, 0.6);
    font-size: 20px;
`;

const IconLink = styled.a`
    color: white;
    font-size: 24px;
    user-select: none;
`;

const Monero = styled.p`
    font-size: 10px;
    font-weight: 400;
    line-height: 1.5;
    text-decoration: underline dotted;
`;

const FooterBodyMain = styled.div`
    grid-column: span 6/span 6;
    word-wrap: break-word;
    padding-right: 20px;
`;

const FooterBodyLinks = styled.div`
    ${(props: { mobile: boolean }) => props.mobile ? `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        & > * + * {
            margin-top: 20px;
        }
    `: `
        grid-template-columns: repeat(3, minmax(0, 1fr));
    
    `}
    grid-column: span 6/span 6;
    display: grid;
`;

const FooterBodySection = styled.div`
    & > * + * {
        margin-top: 10px;
    }
`;

const Link = styled(A)`
    color: white;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

const MobileMenuIcon = styled.div`
    font-size: 28px;
    display: flex;
    align-items: center;
    padding: 8px;
`;

import logo from "/logo.svg";
import ResponsiveMenu from "../components/ResponsiveMenu";

const Base = () => {
    const params = useParams();
    const n = useNavigate();
    const store = useStore();

    onMount(async () => {
        const token = localStorage.getItem("token");
        if (token) {
            const result = (await saveUser(token).catch(() => {})) ?? false;
            if (!result) localStorage.removeItem("token");
        }
    });

    const login = () => {
        // TODO:
        location.href = "https://account.nextania.com/login?continue=" + encodeURIComponent("https://nextania.com/authenticate");
    };

    const account = () => {
        location.href = "https://account.nextania.com/manage";
    };

    onMount(() => {
        if (window.innerWidth < 768) store.set("mobile", true);
        const listener = () => {
            if (window.innerWidth < 768) store.set("mobile", true);
            else store.set("mobile", false);
        };
        window.addEventListener("resize", listener);
        onCleanup(() => window.removeEventListener("resize", listener));
    });

    const toggleMenu = () => store.set("responsiveMenuOpen", !store.get("responsiveMenuOpen"));

    createEffect(() => {
        if (store.get("responsiveMenuOpen")) {
            document.body.style.setProperty("position", "fixed");
        } else {
            document.body.style.setProperty("position", "");
        }
    });

    return (
        <>
            <Header>
                <LogoContainer onClick={() => n("/")}> <LogoBase src={logo} /> <Wordmark /></LogoContainer>
                <Show when={!store.get("mobile")} fallback={
                    <>
                        <MobileMenuIcon onClick={toggleMenu}>
                            <RiSystemMenuFill />
                        </MobileMenuIcon>
                    </>
                }>
                    <HeaderRouteList>
                        <HeaderRoute active={!params.page} onClick={() => n("/")}>Home</HeaderRoute>
                        <HeaderRoute active={params.page === "about"} onClick={() => n("/about")}>About us</HeaderRoute>
                        <HeaderRoute active={params.page === "services"} onClick={() => n("/services")}>Services</HeaderRoute>
                        <DropdownContainer>
                            <HeaderRoute active={params.page === "resources"} onClick={() => n("/resources")}>Resources</HeaderRoute>
                            <DropdownMenu>
                                <DropdownItem onClick={() => n("/resources")}>Overview</DropdownItem>
                                <DropdownItem onClick={() => n("/resources/blog")}>Blog</DropdownItem>
                                <DropdownItem onClick={() => n("/resources/documentation")}>Documentation</DropdownItem>
                                <DropdownItem onClick={() => n("/resources/support")}>Support</DropdownItem>
                                <DropdownItem onClick={() => n("/resources/faq")}>FAQ</DropdownItem>
                                <DropdownItem onClick={() => n("/resources/contact")}>Contact us</DropdownItem>
                            </DropdownMenu>
                        </DropdownContainer>
                    </HeaderRouteList>
                    <AccountContainer>
                        <Show when={store.get("user") !== undefined} fallback={
                            <Button onClick={login}>Log in</Button>
                        }>
                            <Button onClick={account}>Account</Button>
                        </Show>
                    </AccountContainer>
                </Show>
            </Header>
            <Content>
                <Switch fallback={
                    <div>
                        <h1>404</h1>
                        <button onClick={() => n("/")}>Go Home</button>
                    </div>
                }>
                    <Match when={!params.page}>
                        <Home />
                    </Match>
                    <Match when={params.page === "about"}>
                        <About />
                    </Match>
                    <Match when={params.page === "services"}>
                        <Services />
                    </Match>
                    <Match when={params.page === "resources"}>
                        <Resources />
                    </Match>
                </Switch>
            </Content>
            <Footer>
                <FooterHeader>
                    <h2>Try Nextania for free today</h2>
                    <Button>Get started</Button>
                </FooterHeader>
                <FooterBody>
                    <FooterBodyMain>
                        <h1>Nextania</h1>
                        <p>Canada</p>
                        <IconLink href="https://github.com/nextania"><RiLogosGithubFill /></IconLink>
                        <Monero>Monero:  <span title="Due to technical limitations, we are unable to accept form of payment at this time.">4ALqMFtBLV5KHoH6JjPZeuX9WnFKp5kZ49tythEMhFqAbJciqX9Qy5y796kREaU5nLfM1py6Gjt5C9YT1paBNDk8VNzhzRr</span></Monero>
                    </FooterBodyMain>
                    <FooterBodyLinks mobile={store.get("mobile") ?? false}>
                        <FooterBodySection>
                            <h2>Links</h2>
                            <p><Link href="/">Home</Link></p>
                            <p><Link href="/about">About us</Link></p>
                            <p><Link href="/services">Services</Link></p>
                            <p><Link href="/resources">Resources</Link></p>
                        </FooterBodySection>
                        <FooterBodySection>
                            <h2>Resources</h2>
                            <p>Blog</p>
                            <p>Documentation</p>
                            <p>Support</p>
                            <p>FAQ</p>
                            <p>Contact us</p>
                            <p>Terms of service</p>
                            <p>Privacy policy</p>
                        </FooterBodySection>
                        <FooterBodySection>
                            <h2>Services</h2>
                            <p>Harmony</p>
                            <p>Cloudnest</p>
                            <p>Planner</p>
                        </FooterBodySection>
                    </FooterBodyLinks>
                </FooterBody>
                <FooterFooter>
                    <p>© {new Date().getUTCFullYear()} Nextania Cloud Technologies and contributors.</p>
                    <FooterControls>
                        <FooterControl><Circle /> <span>All systems operational</span></FooterControl>
                        <FooterControl><BsGlobe /> <span>English</span></FooterControl>
                    </FooterControls>
                </FooterFooter>
            </Footer>
            <ResponsiveMenu />
        </>
    )
};
export default Base;
