import styled from "styled-components";
import { Search } from "styled-icons/boxicons-regular/Search";

export const SearchBox = styled.div`
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
export const Input = styled.input`
    box-sizing: border-box;
    border: none;
    flex: 200px 1 1;
    height: 40px;
    padding: 0;
    margin: 0;
    padding-left: 10px;
`;
export const Button = styled.button`
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
export const SearchIcon = styled(Search)`
    margin-left: 3px;
    margin-top: 3px;
    width: 30px;
    height: 30px;
`;
