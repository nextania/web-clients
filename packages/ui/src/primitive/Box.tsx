import { ParentProps } from "solid-js";
import { styled } from "solid-styled-components";


const SuccessBox = styled.div`
    background-color: var(--box-success-bg);
    border: 2px solid var(--box-success-border);
    color: var(--box-success-text);
    border-radius: 0.375rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
`;

const InformationBox = styled.div`
    background-color: var(--box-info-bg);
    border: 2px solid var(--box-info-border);
    color: var(--box-info-text);
    border-radius: 0.375rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
`;

const ErrorBox = styled.div`
    background-color: var(--box-error-bg);
    border: 2px solid var(--box-error-border);
    color: var(--box-error-text);
    border-radius: 0.375rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
`;

const WarningBox = styled.div`
    background-color: var(--box-warning-bg);
    border: 2px solid var(--box-warning-border);
    color: var(--box-warning-text);
    border-radius: 0.375rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
`;

export const Box = (props: ParentProps<{ type: "success" | "error" | "warning" | "information" }>) => {
    if (props.type === "success") {
        return (
            <SuccessBox>
                {props.children}
            </SuccessBox>
        );
    } else
    if (props.type === "information") {
        return (
            <InformationBox>
                {props.children}
            </InformationBox>
        );
    } else
    if (props.type === "error") {
        return (
            <ErrorBox>
                {props.children}
            </ErrorBox>
        );
    } else
    if (props.type === "warning") {
        return (
            <WarningBox>
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
