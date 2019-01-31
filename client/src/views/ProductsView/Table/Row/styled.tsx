import styled from "styled-components";

export const LineBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid grey;
    height: 50px;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 5px;
`;
export const CollapseButton = styled.button`
    border: none;
    color: rgba(30, 100, 200, 1);
    background-color: transparent;
    height: 50px;
    width: 50px;
    padding: 10px;
    font-size: 30px;
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
export const BigLabel = styled.label`
    font-size: 24px;
`;
export const SmallLabel = styled.label`
    font-size: 12px;
    width: 100px;
    display: inline-block;
`;
export const CalendarBox = styled.div`
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid grey;
`;
