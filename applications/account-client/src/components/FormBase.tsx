import { createEffect, createSignal, Match, onCleanup, ParentProps, Switch } from "solid-js";
import { styled } from "solid-styled-components";
import { useTranslate } from "../i18n";
import Footer from "./Footer";
import Logo from "./Logo";
import LanguagePicker from "./LanguagePicker";
import { useGlobalState } from "../context";

const FormBase = styled.div`
    padding-top: 2rem;
    padding-bottom: 2rem;
    padding-left: 4rem;
    padding-right: 4rem;
    overflow: hidden;
    background-color: var(--form-background-right);
    width: 62%;

    margin: 10px;
    border-radius: 15px;

    opacity: ${(props: { loading: boolean; }) => props.loading ? 0.5 : 1};
`;

const FormContainerDesktop = styled.div`
    display: flex;
    backdrop-filter: blur(12px);
    background-color: var(--form-background);
    color: var(--foreground);
    width: 750px;
    
    margin: auto;
    box-shadow: var(--form-shadow);
    border-radius: 15px;
    transition: all .3s;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;

        background: var(--glassy);

        backdrop-filter: blur(2px);
        opacity: 0.7;
        mix-blend-mode: soft-light;
        border-radius: 15px;
    }
`;

const FormContainerMobile = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    backdrop-filter: blur(12px);
    /* color: white; */
    color: var(--foreground);
    width: 100%;
    height: 100%;
    padding-top: 2rem;
    padding-bottom: 2rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    overflow: scroll;
    background-color: rgb(255 255 255 / 0.1);
    
    margin: auto;
    box-shadow: 0px 14px 80px rgba(34, 35, 58, 0.4);
    border-radius: 15px;
    transition: all .3s;

    scrollbar-width: none;
`;

const SidePanel = styled.div`
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 38%;
    gap: 2rem;
`;

const MainDesktop = styled.main`
    background: var(--background);
    background-repeat: no-repeat;
    background-size: cover;
    min-height: 100vh;
    display: flex;
    flex-direction: column;  

    width: 100%;
    height: 100%;
    justify-content: center;
    position: relative;
    overflow: hidden;
`;

const MainMobile = styled(MainDesktop)`
    padding: 1.25rem;
`;

const GroupMobile = styled.div`
    text-align: center;
`;

const DetailsMobile = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 1.25rem;
`;

const LogoContainerMobile = styled.div`
    margin-bottom: 1.25rem;
    display: flex;
    justify-content: center;
`;

const LogoContainerDesktop = styled.div`
    margin-bottom: 1.25rem;
`;


const Container = (props: ParentProps) => {
    const [isDesktop, setIsDesktop] = createSignal(window.innerWidth >= 768);
    const state = useGlobalState();
    const t = useTranslate();
    
    let form: HTMLDivElement | undefined;
    
    createEffect(() => {
        const listener = (e: SubmitEvent) => e.preventDefault();
        form?.addEventListener("submit", listener);
        const sizeListener = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        addEventListener("resize", sizeListener);
        onCleanup(() => {
            form?.removeEventListener("submit", listener);
            removeEventListener("resize", sizeListener);
        });
    });
    return (
        <Switch>
            <Match when={!isDesktop()}>
                <MainMobile>
                    <FormContainerMobile>
                        <GroupMobile>
                            <DetailsMobile>
                                <LogoContainerMobile>
                                    <Logo />
                                </LogoContainerMobile>
                                <h2>{t("WELCOME")}</h2>
                                <p>{t("DESCRIPTION")}</p>
                            </DetailsMobile>
                            <div role="form">
                                {props.children}
                            </div>
                        </GroupMobile>
                        <GroupMobile>
                            <LanguagePicker />
                        </GroupMobile>
                    </FormContainerMobile>
                    <Footer desktop={false} />
                </MainMobile>
            </Match>
            <Match when={isDesktop()}>
                
                <MainDesktop>
                    <FormContainerDesktop> 
                        <SidePanel>
                            <div>
                                <LogoContainerDesktop>
                                    <Logo />
                                </LogoContainerDesktop>
                                <h2>{t("WELCOME")}</h2>
                                <p>{t("DESCRIPTION")}</p>
                            </div>
                            <LanguagePicker />
                        </SidePanel>
                        <FormBase loading={state.loading()} ref={form} role="form" >
                            {props.children}
                        </FormBase>
                    </FormContainerDesktop>
                    <Footer desktop={true} />
                </MainDesktop>
            </Match>
        </Switch>
    );
    
};

export default Container;
