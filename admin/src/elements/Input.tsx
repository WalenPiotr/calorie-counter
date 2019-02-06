import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { fonts, colors } from "@theme";

interface InputProps {
    css?: FlattenSimpleInterpolation;
}

export const Input = styled.input`
    border: 1px solid ${colors.border};
    margin: 0 auto;
    display: block;
    box-sizing: border-box;

    padding: 10px;
    font-size: ${fonts.size.medium};
    font-weight: ${fonts.weight.light};

    width: 100%;
    height: 40px;
    font-family: ${fonts.fontFamily};

    ${({ css }: InputProps) => {
        return css;
    }}
`;
