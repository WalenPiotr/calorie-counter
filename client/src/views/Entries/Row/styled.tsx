import styled from "styled-components";
import BlockButton from "@elements/BlockButton";

export const RowBox = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    height: 50px;
    border-top: 1px solid grey;
    width: 100%;
`;

interface ElementProps {
    width: string;
    grow?: boolean;
    shrink?: boolean;
}
export const Element = styled.div`
    flex-basis: ${(props: ElementProps) => props.width};
    flex-grow: ${(props: ElementProps) => (props.grow ? 1 : 0)};
    flex-shrink: ${(props: ElementProps) => (props.shrink ? 1 : 0)};
    text-align: left;
    vertical-align: middle;
    font-size: 14px;
`;
export const ExpandButton = styled.button`
    flex: 40px 0 0;
    height: 50px;
    background-color: none;
    color: rgba(30, 100, 200, 1);
    border: none;
    background-color: transparent;
    font-size: 20px;
`;
interface ControlBoxProps {
    hidden: boolean;
}
export const ControlBox = styled.div`
    display: ${(props: ControlBoxProps) => (props.hidden ? "none" : "flex")};
    width: 90%;
    margin: 20px auto;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    /* border-bottom: 1px solid grey; */
    padding: 10px;
`;

export const NutrientLabel = styled.label`
    margin-top: 10px;
    font-size: 16px;
    font-weight: 500;
`;
export const NutrientValue = styled.label`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 5px;
`;

export const NutrientDiv = styled.div`
    width: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;
export const Box = styled.div``;
export const BlockButtonGroup = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-around;
`;

export const SmallBlockButton = styled(BlockButton)`
    width: 35%;
`;
export const RowCalendarBox = styled.div`
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid grey;
`;
