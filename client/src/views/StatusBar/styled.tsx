import styled, { keyframes, css } from "styled-components";
import { Status } from "@status";

interface BoxProps {
    status: Status;
}

const statusToColor = new Map<Status, string>([
    [Status.None, "transparent"],
    [Status.Success, "rgba(0, 150, 20, 1)"],
    [Status.Error, "rgba(150, 0, 20, 1)"]
]);

export const Box = styled.div`
    z-index: 9;
    position: fixed;
    display: block;
    top: 50px;
    left: 0;
    width: 100vw;
    height: 40px;
    color: white;
    background-color: ${(props: BoxProps) => statusToColor.get(props.status)};
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 200ms linear;
`;
