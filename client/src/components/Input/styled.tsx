import styled, { css } from "styled-components";

export const BaseInput = styled.input`
    box-sizing: border-box;
    text-indent: 10px;
    font-size: 16px;
    border: none;
    box-sizing: border-box;
    :focus {
        outline: none;
    }
`;
interface InputLabelProps {
    red?: boolean;
    align?: string;
}
export const InputLabel = styled.div`
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 8px;
    color: rgba(30, 100, 200, 1);
    ${(props: InputLabelProps) => {
        if (props.red) {
            return css`
                color: red;
            `;
        }
        return;
    }}
    ${(props: InputLabelProps) => {
        if (props.align) {
            return css`
                text-align: ${props.align};
            `;
        }
        return;
    }}
`;
interface InputBoxProps {
    red?: boolean;
}
export const InputBox = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid grey;
    ${(props: InputBoxProps) => {
        if (props.red) {
            return css`
                border: 1px solid red;
            `;
        }
        return;
    }}
    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 20px;
    box-sizing: border-box;
`;
export const MessageBox = styled.div`
    display: flex;
    justify-content: space-between;
`;
