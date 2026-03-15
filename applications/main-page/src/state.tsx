import { createSignal, ParentProps, Setter, useContext } from "solid-js";
import { Accessor, createContext } from "solid-js";

interface User {
    id: string;
    displayName: string;
}

type Language = "en" | "fr";

interface StateKeys {
    user: User;
    language: Language;
    mobile: boolean;
    responsiveMenuOpen: boolean;
}

class Store {
    private data: Record<keyof StateKeys, StateKeys[keyof StateKeys]> = {} as Record<keyof StateKeys, StateKeys[keyof StateKeys]>;
    private random: Accessor<number>;
    private setRandom: Setter<number>;

    constructor() {
        const [random, setRandom] = createSignal(Math.random());
        this.random = random;
        this.setRandom = setRandom;
    }

    public get<K extends keyof StateKeys>(key: K): StateKeys[K] | undefined {
        this.random();
        return this.data[key] as StateKeys[K];
    }

    public set<K extends keyof StateKeys>(key: K, value: StateKeys[K]): void {
        this.data[key] = value;
        this.setRandom(Math.random());
    }


}
const store = new Store();
const StateContext = createContext<Store>();

export const useStore = () => {
    const context = useContext(StateContext);
    if (!context) {
        throw new Error("useStore must be used within a StateProvider");
    }
    return context;
}

export const StateProvider = (props: ParentProps) => {
    return (
        <StateContext.Provider value={store}>
            {props.children}
        </StateContext.Provider>
    );
};

export const saveUser = async (token: string) => {
    const response = await Promise.race([new Promise(r => setTimeout(r, 5000)), fetch("https://account.nextania.com/api/user", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })]).catch(() => null);
    if (response instanceof Response && response.ok) {
        const json = await response.json();
        store.set("user", json);
        return true;
    }
    return false;
}
