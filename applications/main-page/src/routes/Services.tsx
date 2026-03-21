import { styled } from "solid-styled-components";
import { Button } from "@nextania/ui";

const ServicesBase = styled.div`
    display: flex;
    font-size: 1.5rem;
    flex-direction: column;
    width: 100%;
    align-items: center;
    min-height: 80vh;
    margin-top: 2rem;
`;

const ServicesContainer = styled.div`
    width: 60%;
    gap: 2rem;
    display: flex;
    flex-direction: column;
`;

const Service = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 300;
`;

const ServiceDescription = styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    font-size: 1.25rem;
`;


const LearnMore = styled(Button)`
    font-size: 1rem;
`;

const Services = () => {
    return (
        <ServicesBase>
            <h1>Services</h1>
            <ServicesContainer>
                <Service>
                    <ServiceDescription>
                        <h3>Harmony</h3>
                        <p>Harmony is a communication app for individuals and organizations alike.</p>
                    </ServiceDescription>
                    <LearnMore>Learn more</LearnMore>
                </Service>
                <Service>
                    <ServiceDescription>
                        <h3>Radiance</h3>
                        <p>Radiance is a flexible gateway and reverse proxy with hot reloading and a modern UI.</p>
                    </ServiceDescription>
                    <LearnMore>Learn more</LearnMore>
                </Service>
            </ServicesContainer>
        </ServicesBase>
    );
}

export default Services;