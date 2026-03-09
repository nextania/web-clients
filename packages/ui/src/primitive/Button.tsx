import { JSX, ParentProps } from "solid-js";
import { styled } from "solid-styled-components";


const ButtonBase = styled.button`
    border-radius: 0.5rem;
    padding: 0.5rem;
    color: white;
    text-align: center;
    user-select: none;
    background-color: var(--secondary-button);
    &:hover:not(:disabled) {
        filter: brightness(0.85);
    }
    &:focus-visible {
        outline: 3px solid var(--secondary-button);
        outline-offset: 2px;
    }
    &:disabled {
        background-color: #cbd5e0;
        cursor: not-allowed;
        opacity: 0.6;
    }
    width: 100%;

    transition-property: background-color, opacity, filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 250ms;
    border: none;
`;

export const Button = (props: ParentProps<{ 
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>, 
    disabled?: boolean,
}>) => {
    return (
        <ButtonBase 
            onClick={props.onClick} 
            disabled={props.disabled} 
        >
            {props.children}
        </ButtonBase>
    );
};
