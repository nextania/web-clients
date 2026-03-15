import { Select } from "@nextania/ui";
import { useGlobalState } from "../context";
import { Language } from "../i18n";

type LanguageOption = { value: Language; label: string };

const LanguagePicker = () => {
    const state = useGlobalState();
    const getOptions = () => {
        const options: LanguageOption[] = [
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
            { value: "fr", label: "Français" },
            { value: "zh-CN", label: "简体中文" },
            { value: "zh-TW", label: "繁體中文" },
        ];
        return options;
    };
    return (
        <Select options={getOptions()} onChange={e => state.setLanguage(e)} value={state.language()} />
    );
};

export default LanguagePicker;