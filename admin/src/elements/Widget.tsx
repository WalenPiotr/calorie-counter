import * as React from "react";
import styled from "styled-components";
import { colors } from "@theme";

const Outer = styled.div`
    margin: 0 auto;
    width: 95vw;
    border: 1px solid ${colors.border};
    box-shadow: 10px 10px 8px ${colors.shadow};
`;
const Inner = styled.div`
    margin: 5vw;
`;
interface WidgetProps {
    children: React.ReactNode;
}

export class Widget extends React.Component<WidgetProps> {
    render() {
        return (
            <Outer>
                <Inner>{this.props.children}</Inner>
            </Outer>
        );
    }
}
