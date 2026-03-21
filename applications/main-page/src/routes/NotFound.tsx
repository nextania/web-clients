import { styled } from "solid-styled-components";

const Base = styled.div`
    display: flex;
    font-size: 1.5rem;
    flex-direction: column;
    width: 100%;
    align-items: center;
    min-height: 80vh;
    margin-top: 2rem;
`;

const NotFound = () => {
    return (
        <Base>
            <h1>Not found</h1>
            <p>The page you are looking for does not exist.</p>
        </Base>
    );
};

export default NotFound;
