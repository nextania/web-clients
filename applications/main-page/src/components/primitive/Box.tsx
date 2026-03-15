import { ParentProps } from "solid-js";
import { styled } from "solid-styled-components";

const BaseBox = styled.div`
    border-radius: 0.375rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    font-size: 0.9rem;
`;

const SuccessBox = styled(BaseBox)`
    background-color: rgba(0, 220, 154, 0.15);
    border: 2px solid var(--success);
    color: #2dfbb5;
`;

const InformationBox = styled(BaseBox)`
    background-color: rgba(0, 184, 255, 0.15);
    border: 2px solid var(--info);
    color: #5dc9ff;
`;

const ErrorBox = styled(BaseBox)`
    background-color: rgba(255, 61, 95, 0.15);
    border: 2px solid var(--error);
    color: #ff6b8a;
`;

const WarningBox = styled(BaseBox)`
    background-color: rgba(255, 184, 0, 0.15);
    border: 2px solid var(--warning);
    color: #ffd666;
`;

const Box = (props: ParentProps<{ class?: string, type: "success" | "error" | "warning" | "information" }>) => {
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
        <div>
            {props.children}
        </div>
    );
    
};

export default Box;
