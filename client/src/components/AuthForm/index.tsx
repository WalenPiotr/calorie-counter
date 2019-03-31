import * as React from "react";
import styled from "styled-components";
import Widget from "../Widget";
import Input from "../Input";
import { Inputs, Links, Label, Link, Button } from "./styled";
interface LinkParams {
    text: string;
    onClick: () => void;
}
interface ButtonParams {
    text: string;
    onClick: () => void;
}
interface AuthFormProps {
    title: string;
    emailValue: string;
    emailError: string | null;
    onEmailChange: (e: React.FormEvent<HTMLInputElement>) => void;
    passwordValue: string;
    passwordError: string | null;
    onPasswordChange: (e: React.FormEvent<HTMLInputElement>) => void;
    linkParams: LinkParams[];
    buttonParams: ButtonParams;
}
class AuthForm extends React.PureComponent<AuthFormProps, any> {
    render() {
        const props = this.props;
        return (
            <Widget>
                <Label>{props.title}</Label>
                <Inputs>
                    <Input
                        label={"email"}
                        type={"email"}
                        value={props.emailValue}
                        onChange={props.onEmailChange}
                        error={props.emailError}
                    />
                    <Input
                        label={"password"}
                        type={"password"}
                        value={props.passwordValue}
                        onChange={props.onPasswordChange}
                        error={props.passwordError}
                    />
                </Inputs>
                <Links>
                    {props.linkParams.map(param => (
                        <Link key={param.text} onClick={param.onClick}>
                            {param.text}
                        </Link>
                    ))}
                </Links>
                <Button onClick={props.buttonParams.onClick}>
                    {props.buttonParams.text}
                </Button>
            </Widget>
        );
    }
}
export default AuthForm;
