import styled, { FlattenSimpleInterpolation } from "styled-components";
import { fonts, colors } from "@theme";

interface TitleBoxProps {
    css?: FlattenSimpleInterpolation;
}

export const TitleBox = styled.div`
    border-bottom: 1px solid ${colors.border};
    padding-bottom: 10px;

    margin: 0 auto;
    display: block;
    box-sizing: border-box;

    font-size: ${fonts.size.medium};
    font-weight: ${fonts.weight.bold};

    width: 100%;
    height: 30px;

    ${({ css }: TitleBoxProps) => {
        return css;
    }}
`;
