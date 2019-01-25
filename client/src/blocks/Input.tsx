import * as React from "react";
import styled from "styled-components";

const BaseInput = styled.input`
    box-sizing: border-box;
    text-indent: 10px;
    font-size: 20px;
    border: none;
    box-sizing: border-box;
    :focus {
        outline: none;
    }
`;
const InputLabel = styled.div`
    font-weight: 500;
    font-size: 14px;
    text-transform: uppercase;
    margin-left: 10px;
    margin-bottom: 8px;
    color: rgba(30, 100, 200, 1);
`;
const InputBox = styled.div`
    width: 100%;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    border: 1px solid grey;
    padding-top: 10px;
    padding-bottom: 10px;
    margin-bottom: 30px;
    box-sizing: border-box;
`;

interface InputProps {
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.FormEvent<HTMLInputElement>) => void;
}

const Input = ({ label, type, value, onChange }: InputProps) => {
    return (
        <InputBox>
            <InputLabel>{label}</InputLabel>
            <BaseInput
                placeholder=""
                type={type}
                onChange={onChange}
                value={value}
            />
        </InputBox>
    );
};

export default Input;
