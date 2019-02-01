import styled from "styled-components";
import { ChevronLeft } from "styled-icons/boxicons-regular/ChevronLeft";
import { ChevronRight } from "styled-icons/boxicons-regular/ChevronRight";

export const Table = styled.div`
    width: 100%;
    height: 300px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
`;
export const Row = styled.div`
    display: flex;
    flex: calc(100% / 7) 1 1;
    border-top: 1px solid grey;
`;
interface CellProps {
    prev?: boolean;
    current?: boolean;
    logged?: boolean;
    today?: boolean;
}
export const Cell = styled.div`
    :hover {
        background-color: "rgba(30, 100, 200, 0.2);";
    }
    box-sizing: border-box;
    background-color: ${({ prev, current }: CellProps) =>
        prev ? "rgba(30, 100, 200, 1);" : current ? "white" : "lightgrey"};
    color: ${({ prev, current }: CellProps) =>
        prev ? "white" : current ? "black" : "grey"};
    font-weight: ${({ today }: CellProps) => (today ? 500 : 300)};
    border-left: 1px solid grey;
    :first-child {
        border-left: none;
    }
    flex: calc(100% / 7) 1 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    border-bottom: ${({ logged }: CellProps) =>
        logged ? "3px solid green" : "none"};
    cursor: pointer;
`;
export const HeaderCell = styled(Cell)`
    background-color: white;
    color: rgba(30, 100, 200, 1);
    font-weight: 500;
    text-transform: uppercase;
    /* border-bottom: 1px solid grey; */
`;
export const Controls = styled.div`
    width: 100%;
    height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
`;
export const Button = styled.button`
    height: 100%;
    flex: 20% 0 0;
    color: rgba(30, 100, 200, 1);
    background: transparent;
    border: none;
`;
export const Date = styled.label`
    display: flex;
    justify-content: center;
    font-size: 16px;
    flex: 100% 1 1;
    cursor: pointer;
`;

export const ArrowLeft = styled(ChevronLeft)`
    width: 30px;
    height: 30px;
`;
export const ArrowRight = styled(ChevronRight)`
    width: 30px;
    height: 30px;
`;

export const Label = styled.label`
    box-sizing: border-box;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    padding: 10px;
    color: rgba(30, 100, 200, 1);
    height: 20px;
`;
export const Box = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: left;
    justify-content: left;
`;
