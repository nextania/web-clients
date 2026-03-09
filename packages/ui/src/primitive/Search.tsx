import { styled } from "solid-styled-components";

const SearchBarContainer = styled.div`
    background-color: var(--search-bg);
    border-radius: 5px;
    height: 100%;
    border: 1px solid var(--foreground-border);
`;

const SearchBarBase = styled.textarea`
    width: 100%;
    height: 100%;
    background-color: transparent;
    color: var(--search-text);
    border: none;
    outline: none;
    resize: none;
    padding: 10px;
    font-size: 1.2em;
    &::placeholder {
        color: var(--search-placeholder);
    }
    white-space: nowrap;
    scrollbar-width: none;
`


export const Search = () => {
    return (
        <SearchBarContainer>
            <SearchBarBase placeholder="Search here..."></SearchBarBase>
        </SearchBarContainer>
    )
};
