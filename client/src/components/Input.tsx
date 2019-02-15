import * as React from "react";
import styled, { css } from "styled-components";

const BaseInput = styled.input`
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

const InputLabel = styled.div`
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
const InputBox = styled.div`
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

const MessageBox = styled.div`
    display: flex;
    justify-content: space-between;
`;

interface InputProps {
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.FormEvent<HTMLInputElement>) => void;
    error?: string | null;
}

class Input extends React.PureComponent<InputProps> {
    render() {
        const { label, type, value, onChange, error } = this.props;
        return (
            <InputBox red={error !== null}>
                <MessageBox>
                    <InputLabel>{label}</InputLabel>
                    <InputLabel red align={"right"}>
                        {error}
                    </InputLabel>
                </MessageBox>
                <BaseInput
                    placeholder=""
                    type={type}
                    onChange={onChange}
                    value={value}
                />
            </InputBox>
        );
    }
}

export default Input;
