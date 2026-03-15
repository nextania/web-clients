import { styled } from "solid-styled-components";
import { useTranslate } from "../i18n";
import { Link } from "@nextania/ui";
import { VERSION } from "../constants";


const FooterBase = styled.footer`
    color: var(--foreground);
    margin: 1rem;
    text-align: ${(props: { desktop: boolean; }) => props.desktop ? "center" : "center"};
    font-size: 0.875rem;
`;

const Footer = ({ desktop }: { desktop: boolean; }) => {
    const t = useTranslate();
    return (
        <FooterBase desktop={desktop}>
            <p>Nextania Account Services</p>
            <p>{t("ACCOUNT_SERVICES_VERSION")?.replace("{}", VERSION)}</p>
            <p>{t("ACCOUNT_SERVICES_COPYRIGHT")?.replace("{}", new Date().getUTCFullYear().toString())}</p>
            <p><Link href="https://nextania.com/terms">{t("TERMS")}</Link> | <Link href="https://nextania.com/privacy">{t("PRIVACY")}</Link></p>
        </FooterBase>
    );
};

export default Footer;
