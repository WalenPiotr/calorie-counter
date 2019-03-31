import * as React from "react";
import { InputBox, InputLabel, MessageBox, BaseInput } from "./styled";

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
