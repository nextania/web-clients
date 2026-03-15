import { translator } from "@solid-primitives/i18n";
import { useGlobalState } from "../context";
const languages = import.meta.glob("./*.json");
const l = Object.keys(languages).reduce((acc, key) => {
    const lang = key.split("/")[1].split(".")[0] as Language;
    acc[lang as Language] = async () => {
        const imp = languages[key] as () => Promise<Record<string, string>>;
        return await imp();
    };
    return acc;
}, {} as Record<Language, () => Promise<Record<string, string>>>);

export const Language = union([
    literal("en"),
    literal("es"),
    literal("fr"),
    literal("zh-CN"),
    literal("zh-TW"),
]);
export type Language = Infer<typeof Language>;

const fetchDictionary = async (lang: Language) => {
    return await l[lang]();
}

import { createResource } from "solid-js";
import { Infer, literal, union } from "superstruct";

export const useTranslate = () => {
    const state = useGlobalState();
    const [dict] = createResource(state.language, fetchDictionary);
    return translator(dict);
};

export const getLanguage = () => {
    const defaultLang = localStorage.getItem("language") || navigator.language
    if (Language.is(defaultLang)) return defaultLang;
    const baseLang = defaultLang.split("-")[0];
    if (Language.is(baseLang)) return baseLang;
    return "en";
};
