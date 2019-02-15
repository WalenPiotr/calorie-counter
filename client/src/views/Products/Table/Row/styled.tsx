import styled, { css } from "styled-components";

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
    flex: 40px 0 0;
    height: 50px;
    background-color: none;
    color: rgba(30, 100, 200, 1);
    border: none;
    background-color: transparent;
    font-size: 20px;
`;

export const InfoBox = styled.div`
    flex: 100px 1 0;
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

interface VoteButtonProps {
    red?: boolean;
    green?: boolean;
}

export const VoteBox = styled.div`
    box-sizing: border-box;
    margin-right: 5px;
    padding-right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid grey;
    height: 45px;
`;

export const VoteButton = styled.button`
    background-color: transparent;
    border: none;
    width: 40px;
    height: 40px;
    flex: 40px 0 0;
    ${(props: VoteButtonProps) => {
        if (props.red) {
            return css`
                color: rgba(150, 0, 20, 1);
            `;
        }
        if (props.green) {
            return css`
                color: rgba(0, 150, 20, 1);
            `;
        }
        return css`
            color: rgba(30, 100, 200, 1);
        `;
    }}
`;
export const Votes = styled.label`
    display: flex;
    justify-content: center;
    padding-right: 3px;
    align-items: left;
`;
