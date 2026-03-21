import { ParentProps } from "solid-js";
import { styled } from "solid-styled-components";


const BaseBox = styled.div`
    border-radius: 0.375rem;
    padding: 0.5rem;
    font-size: 0.875rem;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
`;

const SuccessBox = styled(BaseBox)`
    background-color: var(--box-success-bg);
    border: 2px solid var(--box-success-border);
    color: var(--box-success-text);
`;

const InformationBox = styled(BaseBox)`
    background-color: var(--box-info-bg);
    border: 2px solid var(--box-info-border);
    color: var(--box-info-text);
`;

const ErrorBox = styled(BaseBox)`
    background-color: var(--box-error-bg);
    border: 2px solid var(--box-error-border);
    color: var(--box-error-text);
`;

const WarningBox = styled(BaseBox)`
    background-color: var(--box-warning-bg);
    border: 2px solid var(--box-warning-border);
    color: var(--box-warning-text);
`;

export const Box = (props: ParentProps<{ class?: string; type: "success" | "error" | "warning" | "information" }>) => {
    if (props.type === "success") {
        return (
            <SuccessBox class={props.class}>
                {props.children}
            </SuccessBox>
        );
    } else
    if (props.type === "information") {
        return (
            <InformationBox class={props.class}>
                {props.children}
            </InformationBox>
        );
    } else
    if (props.type === "error") {
        return (
            <ErrorBox class={props.class}>
                {props.children}
            </ErrorBox>
        );
    } else
    if (props.type === "warning") {
        return (
            <WarningBox class={props.class}>
                {props.children}
            </WarningBox>
        );
    }
    return (
        <div class={props.class}>
            {props.children}
        </div>
    );
    
};
