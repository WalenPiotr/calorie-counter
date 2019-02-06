import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { colors, fonts } from "@theme";

interface ButtonProps {
    red?: boolean;
    green?: boolean;
    large?: boolean;
    small?: boolean;
    block?: boolean;
    css?: FlattenSimpleInterpolation;
}

export const Button = styled.button`
    border: none;
    font-family: ${fonts.fontFamily};
    border-radius: 3px;
    ${({ large, small }: ButtonProps) => {
        if (large) {
            return css`
                font-size: ${fonts.size.large};
                padding-left: 25px;
                padding-right: 25px;
                height: 50px;
            `;
        }
        if (small) {
            return css`
                font-size: ${fonts.size.small};
                padding-left: 15px;
                padding-right: 15px;
                height: 30px;
            `;
        }
        return css`
            font-size: ${fonts.size.medium};
            padding-left: 20px;
            padding-right: 20px;
            height: 40px;
        `;
    }};
    ${({ block }: ButtonProps) => {
        if (block) {
            return css`
                width: 100%;
                text-align: center;
            `;
        }
        return;
    }}
    ${({ red, green }: ButtonProps) => {
        if (red) {
            return css`
                color: ${colors.button.red.text};
                background-color: ${colors.button.red.background};
            `;
        }
        if (green) {
            return css`
                color: ${colors.button.green.text};
                background-color: ${colors.button.green.background};
            `;
        }
        return css`
            color: ${colors.button.blue.text};
            background-color: ${colors.button.blue.background};
        `;
    }}
    ${({ css }: ButtonProps) => {
        if (css) {
            return css;
        }
        return;
    }}
`;
