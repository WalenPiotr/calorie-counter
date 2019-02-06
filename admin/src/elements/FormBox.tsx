import * as React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
    margin-top: 20px;
    :last-child {
        margin-bottom: 20px;
    }
`;
const Box = styled.div`
    display: flex;
    flex-direction: column;
    align-items: left;

`;
interface FormBoxProps {
    children: React.ReactNode[];
    
}

export class FormBox extends React.PureComponent<FormBoxProps> {
    render() {
        return (
            <Box>
                {this.props.children.map(
                    (child: React.ReactNode, index: number) => (
                        <Wrapper key={index}>{child}</Wrapper>
                    )
                )}
            </Box>
        );
    }
}
