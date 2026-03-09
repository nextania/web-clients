import { JSX, ParentProps } from "solid-js";
import { styled } from "solid-styled-components";


const LinkBase = styled.a`
    color: var(--secondary);
    text-decoration: none;
    &:focus-visible {
        outline: 3px solid var(--secondary);
        outline-offset: 2px;
        border-radius: 2px;
    }
`;

export const Link = (props: ParentProps<{ 
    href: string; 
    onClick?: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent>,
}>) => {
    return (
        <LinkBase 
            href={props.href} 
            onClick={props.onClick}
        >
            {props.children}
        </LinkBase>
    );
};
