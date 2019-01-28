import styled from "styled-components";
import { ChevronLeft } from "styled-icons/boxicons-regular/ChevronLeft";
import { ChevronRight } from "styled-icons/boxicons-regular/ChevronRight";

export const Table = styled.div`
    border-bottom: 1px solid grey;
    width: 100%;
    height: 300px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
`;
export const Row = styled.div`
    display: flex;
    flex: calc(100% / 7) 1 1;
    border-right: 1px solid grey;
    border-top: 1px solid grey;
`;
interface CellProps {
    prev?: boolean;
    current?: boolean;
    logged?: boolean;
}
export const Cell = styled.div`
    box-sizing: border-box;
    background-color: ${({ prev, current }: CellProps) =>
        prev ? "rgba(30, 100, 200, 1);" : current ? "white" : "lightgrey"};
    color: ${({ prev, current }: CellProps) =>
        prev ? "white" : current ? "black" : "grey"};
    border-bottom: ${({ logged }: CellProps) =>
        logged ? "3px solid red" : "none"};
    border-left: 1px solid grey;
    flex: calc(100% / 7) 1 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
`;
export const HeaderCell = styled(Cell)`
    background-color: white;
    font-size: 18px;
    color: rgba(30, 100, 200, 1);
    font-weight: 500;
    text-transform: uppercase;
    border-bottom: 2px solid grey;
`;
export const Controls = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
`;
export const Button = styled.button`
    height: 100%;
    flex: 20% 0 0;
    color: rgba(30, 100, 200, 1);
    background: transparent;
    border: none;
`;
export const Label = styled.label`
    display: flex;
    justify-content: center;
    font-size: 20px;
    flex: 100% 1 1;
`;

export const ArrowLeft = styled(ChevronLeft)`
    width: 50px;
    height: 50px;
`;
export const ArrowRight = styled(ChevronRight)`
    width: 50px;
    height: 50px;
`;
export const Box = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
`;
