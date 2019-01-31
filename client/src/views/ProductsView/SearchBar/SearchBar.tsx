import * as React from "react";
import styled from "styled-components";
import { Search } from "styled-icons/boxicons-regular/Search";

interface SearchBarProps {
    onSearchClick: () => void;
    onSearchInputChange: (e: React.FormEvent<HTMLInputElement>) => void;
    searchInput: string;
}
interface SearchBarState {}

const SearchBox = styled.div`
    width: 100%;
    display: flex;
    border: 1px solid rgba(30, 100, 200, 1);
    margin-top: 20px;
    margin-bottom: 20px;
    height: 40px;
    border-bottom-right-radius: 20px;
    border-top-right-radius: 20px;
    background: white;
    position: relative;
`;
const Input = styled.input`
    box-sizing: border-box;
    border: none;
    flex: 200px 1 1;
    height: 40px;
    padding: 0;
    margin: 0;
    padding-left: 10px;
`;
const Button = styled.button`
    position: absolute;
    right: -2px;
    top: -5px;
    width: 50px;
    height: 50px;
    border-radius: 30px;
    color: white;
    background-color: rgba(30, 100, 200, 1);
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
`;
const SearchIcon = styled(Search)`
    margin-left: 3px;
    margin-top: 3px;
    width: 30px;
    height: 30px;
`;

class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
    render() {
        return (
            <SearchBox>
                <Input
                    placeholder="Enter product you are looking for :)"
                    value={this.props.searchInput}
                    onChange={this.props.onSearchInputChange}
                />
                <Button onClick={this.props.onSearchClick}>
                    <SearchIcon />
                </Button>
            </SearchBox>
        );
    }
}
export default SearchBar;
