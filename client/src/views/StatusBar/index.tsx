import * as React from "react";
import * as Styled from "./styled";
import { Status } from "@status";

interface StatusBarProps {
    status: Status;
    message: string;
}
const StatusBar = (props: StatusBarProps) => {
    const component = (
        <Styled.Box status={props.status}>{props.message}</Styled.Box>
    );
    return component;
};

export default StatusBar;
