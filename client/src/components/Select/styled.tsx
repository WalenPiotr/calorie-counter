import styled from "styled-components";

export const Box = styled.div`
    position: relative;
    width: 100%;
    border: 1px solid grey;
    display: flex;
    justify-content: space-between;
    height: 65px;
    cursor: pointer;
`;
export const Label = styled.div`
    padding-top: 10px;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    margin-left: 10px;
    margin-bottom: 8px;
    color: rgba(30, 100, 200, 1);
`;

export const Value = styled.div`
    margin-left: 10px;
    font-size: 16px;
    cursor: pointer;
`;
export const Button = styled.button`
    border: none;
    color: rgba(30, 100, 200, 1);
    background-color: transparent;
    height: 65px;
    width: 72px;
    padding-top: 20px;
    padding-left: 32px;
    padding-right: 12px;
    font-size: 30px;
    color: rgba(30, 100, 200, 1);
    outline: none;
    cursor: pointer;
`;
export const Collapsable = styled.div`
    display: ${(props: { collapse: boolean }) =>
        props.collapse ? "none" : "block"};
    position: absolute;
    top: 66px;
    left: -1px;
    width: 100%;
    background-color: red;
    z-index: 10;
`;
export const Option = styled.div`
    background-color: white;
    border-bottom: 1px solid grey;
    border-left: 1px solid grey;
    border-right: 1px solid grey;
    height: 50px;
    width: calc(100% - 10px);
    padding-left: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
`;
