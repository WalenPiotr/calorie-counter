import styled, { css, FlattenSimpleInterpolation } from "styled-components";

interface FlexBoxProps {
    css?: FlattenSimpleInterpolation;
}

export const FlexBox = styled.div`
    display: flex;
    ${({ css }: FlexBoxProps) => {
        return css;
    }}
`;
