import * as React from "react";
import styled from "styled-components";
import Widget from "../elements/Widget";
import BlockButton from "../elements/BlockButton";
import Input from "../blocks/Input";

const Inputs = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 85%;
`;
const Label = styled.div`
    width: 85%;
    color: grey;
    font-size: 24px;
    text-transform: uppercase;
    border-bottom: 1px solid grey;
    box-sizing: border-box;
    padding: 5px;
    padding-bottom: 15px;
    margin-bottom: 30px;
`;
const Links = styled.div`
    display: flex;
    justify-content: space-between;
    text-decoration: none;
    color: rgba(30, 100, 200, 1);
    width: 80%;
    margin-bottom: 20px;
`;
const Link = styled.a`
    text-decoration: none;
`;
const Button = styled(BlockButton)`
    width: 85%;
`;

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
    onEmailChange: (e: React.FormEvent<HTMLInputElement>) => void;
    passwordValue: string;
    onPasswordChange: (e: React.FormEvent<HTMLInputElement>) => void;
    linkParams: LinkParams[];
    buttonParams: ButtonParams;
}
const AuthForm = (props: AuthFormProps) => {
    return (
        <Widget>
            <Label>{props.title}</Label>
            <Inputs>
                <Input
                    label={"email"}
                    type={"email"}
                    value={props.emailValue}
                    onChange={props.onEmailChange}
                />
                <Input
                    label={"password"}
                    type={"password"}
                    value={props.passwordValue}
                    onChange={props.onPasswordChange}
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
};
export default AuthForm;
