import { createSignal, JSX } from "solid-js";
import { styled } from "solid-styled-components";

const InputContainer = styled.div`
    position: relative;
`;

const InputBase = styled.input`
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.375rem;
    background-color: transparent;
    border: 1px solid var(--foreground-border);
    box-sizing: border-box;
    
    &:focus {
        border: 1px solid var(--secondary);
        outline: none;
    }
    
    transition: 50ms ease-in-out;
`;

const InputLabel = styled.label`
    color: var(--foreground);
    background: transparent;
    font-size: 0.875rem;
    position:absolute;
    left:0;
    top:0;
    margin: 0.5rem;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    transition: 0.2s ease-in-out;
    border-radius: 5px;
    ${(props: { focused: boolean; empty: boolean }) => props.focused || !props.empty ? `
        font-size: 0.75rem;
        transform: translateY(-100%);
        background: var(--form-background-right);
        color: var(--secondary);
        pointer-events: none;
        ` : ""}
        
`;


interface Props { 
    loading: boolean;
    type?: "password" | "email";
    placeholder?: string; 
    onKeyDown?: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent>; 
    value?: string;
    onChange?: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event>;
    autocomplete?: string;
    required?: boolean;
}

export const Input = (props: Props) => {
    const [focused, setFocused] = createSignal(false);
    const inputId = `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
        <InputContainer>
            <InputBase
                id={inputId}
                type={props.type ? props.type : "text"}
                disabled={props.loading}
                onKeyDown={props.onKeyDown}
                value={props.value}
                onChange={e => {
                    props.onChange && (props.onChange as Function)(e);
                }}
                onFocusIn={() => setFocused(true)}
                onFocusOut={() => setFocused(false)}
                aria-label={props.placeholder}
                autocomplete={props.autocomplete}
                required={props.required}
            />
            <InputLabel for={inputId} focused={focused()} empty={props.value === ""}>{props.placeholder}</InputLabel>
        </InputContainer>
    );
};
