import { Accessor, createContext, createEffect, createSignal, ParentProps, Setter, useContext } from "solid-js";
import { Client, CurrentUser, ServerConfiguration } from "@nextania/core-api";
import { getLanguage, Language } from "./i18n";
import { createStore, SetStoreFunction } from "solid-js/store";

const StateContext = createContext<GlobalState>();

export const useGlobalState = () => {
    const context = useContext(StateContext);
    if (!context) throw new Error("useGlobalState must be used within a StateProvider");
    return context;
};

interface GlobalState {
    language: Accessor<Language>;
    setLanguage: Setter<Language>;
    loading: Accessor<boolean>;
    setLoading: Setter<boolean>;
    serverConfig: ServerConfiguration;
}

export const GlobalStateProvider = (props: ParentProps<{ serverConfig: ServerConfiguration }>) => {
    const [language, setLanguage] = createSignal<Language>(getLanguage());
    const [loading, setLoading] = createSignal(false);
    createEffect(() => {
        localStorage.setItem("language", language());
    });
    return (
        <StateContext.Provider value={{
            language,
            setLanguage,
            loading,
            setLoading,
            serverConfig: props.serverConfig,
        }}>
            {props.children}
        </StateContext.Provider>
    );
};

const UserContext = createContext<UserState>();

export const useUserState = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUserState must be used within a UserProvider");
    return context;
};

export const useUserStateOptionally = () => useContext(UserContext);

interface UserState {
    session: Client;
    settings: CurrentUser;
    updateSettings: SetStoreFunction<CurrentUser>;
    keyB: Uint8Array;
}

export const UserStateProvider = (props: ParentProps<{ session: Client, initialSettings: CurrentUser, keyB: Uint8Array }>) => {
    const [settings, setSettings] = createStore(props.initialSettings);
    return (
        <UserContext.Provider value={{
            session: props.session,
            settings,
            updateSettings: setSettings,
            keyB: props.keyB,
        }}>
            {props.children}
        </UserContext.Provider>
    );
};
