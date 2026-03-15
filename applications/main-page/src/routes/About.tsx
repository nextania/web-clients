import { styled } from "solid-styled-components";

const AboutBase = styled.div`
    display: flex;
    font-size: 1.5rem;
    flex-direction: column;
    width: 100%;
    align-items: center;
    min-height: 80vh;
    margin-top: 2rem;
`;

const About = () => {
    return (
        <AboutBase>
            <h1>About</h1>
            <p>
                Hmm, I wonder what this is all about. Coming soon!
            </p>
        </AboutBase>
    );
}

export default About;