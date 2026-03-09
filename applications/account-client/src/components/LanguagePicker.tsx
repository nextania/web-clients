import { createMemo } from "solid-js";
import { Select } from "@nextania/ui";
import { useGlobalState } from "../context";
import { Language, useTranslate } from "../utilities/i18n";

const LanguagePicker = () => {
    const state = createMemo(() => useGlobalState());
    const t = useTranslate();
    const getOptions = () => {
        const options: { value: Language; label: string }[] = [
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
            { value: "fr", label: "Français" },
            { value: "zh-CN", label: "简体中文" },
            { value: "zh-TW", label: "繁體中文" },
        ];
        return options;
    }
    return (
        <Select options={getOptions()} onChange={e => {
            state().update("sessionData", { language: e });
            localStorage.setItem("lang", e);
        }} value={state().get("sessionData").language}>
        </Select>
    )
}

export default LanguagePicker;