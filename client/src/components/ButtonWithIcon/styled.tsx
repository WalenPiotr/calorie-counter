import { colors, fonts } from "@theme";
import styled, { css } from "styled-components";
interface ButtonProps {
    disabled?: boolean;
}
export const Button = styled.button`
    ${(props: ButtonProps) => {
        if (props.disabled) {
            return css`
                color: ${colors.base.grey.background};
            `;
        }
        return css`
            color: ${colors.base.blue.background};
        `;
    }}
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-size: ${fonts.size.small};
    width: 50px;
    height: 50px;
    border: none;
`;
