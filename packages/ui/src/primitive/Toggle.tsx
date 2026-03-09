import { type Accessor, type Setter, type JSX } from "solid-js";
import { styled } from "solid-styled-components";

const ToggleBase = styled.label`
    position: relative;
    display: inline-block;
    width: 42px;
    height: 26px;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    margin-right: 0.2rem;
    border: 1px solid transparent;
    
    input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    &:focus-within {
        outline: none;
    }
    
    &:focus-within:not(:has(input:disabled)) {
        box-shadow: 0 0 0 2px var(--focus-ring);
        border-radius: 5px;
    }
`;

const Slider = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--toggle-inactive);
    border-radius: 5px;
    transition: 0.2s;
    
    ${(props: { checked: boolean; disabled?: boolean }) => props.checked ? `
        background-color: var(--secondary-button);
    ` : ""}
    
    ${(props: { checked: boolean; disabled?: boolean }) => props.disabled ? `
        opacity: 0.5;
        cursor: not-allowed;
        background-color: var(--disabled-bg);
    ` : ""}
    
    &:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        border-radius: 5px;
        transition: 0.2s;
        ${(props: { checked: boolean; disabled?: boolean }) => props.checked ? `
            transform: translateX(16px);
        ` : ""}
    }
`;

interface ToggleProps { 
    checked: Accessor<boolean|undefined>|Accessor<boolean>; 
    setChecked: Setter<boolean|undefined>|Setter<boolean>; 
    onChange?: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event>, 
    disabled?: boolean; 
};

export const Toggle = ({ checked, setChecked, onChange, disabled }: ToggleProps) => {
    return (
        <ToggleBase>
            <input type="checkbox" checked={checked()} onChange={e => {
                (setChecked as Setter<boolean>)(e.currentTarget.checked);
                (onChange as Function | undefined)?.(e);
            }} disabled={disabled} />
            <Slider checked={checked()??false} disabled={disabled} />
        </ToggleBase>
    )
};

export const ToggleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;
