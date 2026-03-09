import { ParentProps } from "solid-js";
import { styled } from "solid-styled-components";

const ErrorTextBase = styled.p`
    color: #f64f59;
    min-height: 48px;
`;

const ErrorText = (props: ParentProps) => {
    return (
        <ErrorTextBase 
            role="alert" 
            aria-live="polite"
        >
            {props.children}
        </ErrorTextBase>
    );
};

export default ErrorText;
