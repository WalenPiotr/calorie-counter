import styled from "styled-components";
import BlockButton from "@elements/BlockButton";

interface PortionGroupProps {
    single: boolean;
}
export const PortionGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    padding-top: ${(props: PortionGroupProps) =>
        props.single ? "10px" : "40px"};
    border-top: 1px solid grey;
`;
export const BaseGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;
export const Button = styled(BlockButton)``;
export const XButton = styled.button`
    position: absolute;
    background-color: rgba(30, 100, 200, 1);
    color: white;
    border: none;
    top: 5px;
    left: 0px;
    width: 60px;
    height: 30px;
    font-weight: 500;
`;

export const Label = styled.div`
    width: 85%;
    color: grey;
    font-size: 24px;
    text-transform: uppercase;
    border-bottom: 1px solid grey;
    box-sizing: border-box;
    padding: 5px;
    padding-bottom: 15px;
    margin-bottom: 30px;
`;

export const Spacer = styled.div`
    border-bottom: 1px solid grey;
    width: 85%;
    height: 10px;
    margin-bottom: 10px;
`;
