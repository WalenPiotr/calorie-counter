import * as React from "react";
import styled from "styled-components";
import { size, minWidth } from "@media";

const Outer = styled.div`
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    box-shadow: 3px 3px 50px 6px rgba(0, 0, 0, 0.2);
    margin: 10vh auto;

    width: 95vw;
    @media ${minWidth(size.tablet)} {
        width: 75vw;
    }
    @media ${minWidth(size.laptop)} {
        width: 55vw;
    }
    @media ${minWidth(size.laptopL)} {
        width: 35vw;
    }
    @media ${minWidth(size.desktop)} {
        width: 35vw;
    }
`;
const Inner = styled.div`
    width: 90%;
    margin: 5%;
    margin-top: 30px;
    margin-bottom: 30px;
`;
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
