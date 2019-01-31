import * as React from "react";
import * as Styled from "./styled";

interface SearchBarProps {
    onSearchClick: () => void;
    onSearchInputChange: (e: React.FormEvent<HTMLInputElement>) => void;
    searchInput: string;
}
interface SearchBarState {}

class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
    render() {
        return (
            <Styled.SearchBox>
                <Styled.Input
                    placeholder="Enter product you are looking for :)"
                    value={this.props.searchInput}
                    onChange={this.props.onSearchInputChange}
                />
                <Styled.Button onClick={this.props.onSearchClick}>
                    <Styled.SearchIcon />
                </Styled.Button>
            </Styled.SearchBox>
        );
    }
}
export default SearchBar;
