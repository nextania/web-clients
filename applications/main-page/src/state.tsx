import { createSignal, onCleanup, onMount, ParentProps, Setter, useContext } from "solid-js";
import { Accessor, createContext } from "solid-js";

interface User {
    id: string;
    displayName: string;
}

type Language = "en" | "fr";

interface Store {
    user: Accessor<User | undefined>;
    setUser: Setter<User | undefined>;
    language: Accessor<Language>;
    setLanguage: Setter<Language>;
    mobile: Accessor<boolean>;
    responsiveMenuOpen: Accessor<boolean>;
    setResponsiveMenuOpen: Setter<boolean>;
}

const StateContext = createContext<Store>();

export const useStore = () => {
    const context = useContext(StateContext);
    if (!context) {
        throw new Error("useStore must be used within a StateProvider");
    }
    return context;
}

export const StateProvider = (props: ParentProps) => {
    const [language, setLanguage] = createSignal<Language>("en");
    const [mobile, setMobile] = createSignal(false);
    const [responsiveMenuOpen, setResponsiveMenuOpen] = createSignal(false);
    const [user, setUser] = createSignal<User>();
    onMount(() => {
        if (window.innerWidth < 768) setMobile(true);
        const listener = () => {
            if (window.innerWidth < 768) setMobile(true);
            else setMobile(false);
        };
        window.addEventListener("resize", listener);
        onCleanup(() => window.removeEventListener("resize", listener));
    });
    return (
        <StateContext.Provider value={{ language, setLanguage, mobile, responsiveMenuOpen, setResponsiveMenuOpen, user, setUser }}>
            {props.children}
        </StateContext.Provider>
    );
};

export const getUser = async (token: string) => {
    const response = await Promise.race([new Promise(r => setTimeout(r, 5000)), fetch("https://account.nextania.com/api/user", {
        headers: {
            Authorization: token,
        },
    })]).catch(() => null);
    if (response instanceof Response && response.ok) {
        return await response.json() as User;
    }
};
