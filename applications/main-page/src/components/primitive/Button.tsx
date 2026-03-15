import { JSX, ParentProps } from "solid-js";
import { styled } from "solid-styled-components";


const ButtonBase = styled.button`
    border-radius: 0.5rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    color: white;
    text-align: center;
    cursor: default;
    user-select: none;
    background: var(--secondary);
    &:hover {
        filter: brightness(0.85);
    }
    &:disabled {
        background-color: #cbd5e0;
    }

    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 250ms;
    border: none;
`;

const Button = (props: ParentProps<{ class?: string, onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>, disabled?: boolean }>) => {
    return (
        <ButtonBase class={props.class} onClick={props.onClick} disabled={props.disabled} type="submit">
            {props.children}
        </ButtonBase>
    );
};

export default Button;
