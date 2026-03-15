import { styled } from "solid-styled-components";

const ResourcesBase = styled.div`
    display: flex;
    font-size: 1.5rem;
    flex-direction: column;
    width: 100%;
    align-items: center;
    min-height: 80vh;
    margin-top: 2rem;
`;

const Resources = () => {
    return (
        <ResourcesBase>
            <h1>Resources</h1>
            <p>
                Hmm, I wonder what this is all about. Coming soon!
            </p>
        </ResourcesBase>
    );
}

export default Resources;