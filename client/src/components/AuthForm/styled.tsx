import styled from "styled-components";
import BlockButton from "../../elements/BlockButton";

export const Inputs = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;
export const Label = styled.div`
    color: grey;
    font-size: 24px;
    text-transform: uppercase;
    border-bottom: 1px solid grey;
    box-sizing: border-box;
    padding: 5px;
    padding-bottom: 15px;
    margin-bottom: 30px;
`;
export const Links = styled.div`
    display: flex;
    justify-content: space-between;
    text-decoration: none;
    color: rgba(30, 100, 200, 1);
    margin-bottom: 20px;
`;
export const Link = styled.a`
    text-decoration: none;
`;
export const Button = styled(BlockButton)`
    width: 100%;
`;
