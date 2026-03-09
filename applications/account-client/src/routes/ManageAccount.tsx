import { styled } from "solid-styled-components";
import { Search } from "@nextania/ui";
import Logo from "../components/Logo";
import { RiBusinessProfileFill, RiBusinessProfileLine, RiSystemShieldKeyholeFill, RiSystemShieldKeyholeLine, RiUserFacesAccountBoxFill, RiUserFacesAccountBoxLine } from "solid-icons/ri";
import MenuItem from "../components/MenuItem";
import { Navigate, useNavigate, useParams } from "@solidjs/router";
import { Accessor, Match, Setter, Switch } from "solid-js";
import Account from "./manage/Account";
import Profile from "./manage/Profile";
import Dialog from "@corvu/dialog";
import Popover from "@corvu/popover";
import AccountContainer from "../components/AccountContainer";
import Sessions from "./manage/Sessions";
import { Show } from "solid-js";
import ContextMenuButton from "../components/ContextMenuButton";
import { useTranslate } from "../utilities/i18n";
import LanguagePicker from "../components/LanguagePicker";

const MainDesktop = styled.main`
    background: var(--background);
    
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;  
    width: 100%;
    height: 100%;
    justify-content: center;
`;

const ManageBase = styled.div`
    display:flex;
    background-color: #f2d1ff;
    @media (prefers-color-scheme: dark) {
        background-color: #1f002f;
        color: white;
    }
    backdrop-filter: blur(5px);
    border-radius: 5px;
    padding-left: 10px;
    padding-right:10px;
    height: 100%;
    min-height: 100% !important;
`;

const LeftPanel = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 250px;
    padding-right: 10px;
    @media (prefers-color-scheme: dark) {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    justify-content: space-between;
    padding-bottom: 10px;
    gap: 20px;
`;

const RightPanel = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;

`;

const Navigation = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 20px;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    height: 64px;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
    & > * + * {
        margin-top: 20px;
    }
    overflow-y: auto;
    overflow-x: auto;
`;

const LogoContainer = styled.div`
    display: flex;
    padding: 10px;
    height: 64px;
    align-items: center;
`;

export const Section = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 400px;
`;

const Overlay = styled(Popover.Overlay)`
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`;

const PopoverContent = styled(Popover.Content)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 5px;
    padding: 20px;
    z-index: 1001;
    box-shadow: 0px 14px 80px rgba(34, 35, 58, 0.4);
`;

const TopContainer = styled.div`
    display: flex;
    flex-direction: column;
`;


const ManageAccount = ({ loading, setLoading }: { loading: Accessor<boolean>; setLoading: Setter<boolean>; }) => {
    const params = useParams();
    const navigate = useNavigate();
    const t = useTranslate();
    const logout = () => {
        navigate("/logout");
    };
    return (
        <Show when={params.category} fallback={
            <Navigate href="/manage/account" />
        }>
            <Popover placement="bottom-start">
                <MainDesktop>
                    <ManageBase>
                        <LeftPanel>
                            <TopContainer>
                                <LogoContainer>
                                    <Logo />
                                </LogoContainer>
                                <Navigation>
                                    <MenuItem Icon={RiUserFacesAccountBoxLine} BoldIcon={RiUserFacesAccountBoxFill} name={t("MANAGE_ACCOUNT")!} id="account" active={params.category!} />
                                    <MenuItem Icon={RiBusinessProfileLine} BoldIcon={RiBusinessProfileFill} name={t("PROFILE")!} id="profile" active={params.category!} />
                                    <MenuItem Icon={RiSystemShieldKeyholeLine} BoldIcon={RiSystemShieldKeyholeFill} name={t("SESSIONS")!} id="sessions" active={params.category!} />
                                </Navigation>
                            </TopContainer>
                            <LanguagePicker />
                        </LeftPanel>
                        <RightPanel>
                            <TopBar>
                                
                                <Search />
                                <AccountContainer />
                            </TopBar>
                            <Content>
                                <Switch>
                                    <Match when={params.category === "account"}>
                                        <Dialog closeOnOutsidePointer={false}>
                                            <Account loading={loading} setLoading={setLoading} />
                                        </Dialog>
                                    </Match>
                                    <Match when={params.category === "profile"}>
                                        <Dialog closeOnOutsidePointer={false}>
                                            <Profile loading={loading} setLoading={setLoading} />
                                        </Dialog>
                                    </Match>
                                    <Match when={params.category === "sessions"}>
                                        <Sessions />
                                    </Match>
                                </Switch>
                            </Content>
                        </RightPanel>
                    </ManageBase>
                </MainDesktop>
                <Popover.Portal>
                    <Overlay />
                    <PopoverContent>
                        <ContextMenuButton onClick={logout}>Logout</ContextMenuButton>
                    </PopoverContent>
                </Popover.Portal>
            </Popover>
        </Show>
    );
}

export default ManageAccount;
