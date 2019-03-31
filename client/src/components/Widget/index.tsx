import * as React from "react";
import { Inner, Outer } from "./styled";
interface WidgetProps {
    children: React.ReactNode;
}
class Widget extends React.Component<WidgetProps> {
    render() {
        return (
            <Outer>
                <Inner>{this.props.children}</Inner>
            </Outer>
        );
    }
}
export default Widget;
