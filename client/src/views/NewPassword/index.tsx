import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as requests from "@requests";
import styled from "styled-components";
import Input from "@components/Input";
import Widget from "@components/Widget";
import BlockButton from "@elements/BlockButton";
import { validatePassword } from "@inputValidation";
import { Status } from "@status";

interface VerifyAccountProps extends RouteComponentProps<{ token: string }> {
    setStatus: (status: Status, message: string) => void;
}
interface VerifyAccountState {
    password: string;
    passwordError: string | null;
}
class VerifyAccount extends React.Component<
    VerifyAccountProps,
    VerifyAccountState
> {
    state = {
        password: "",
        passwordError: null,
    };
    handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
        const password = event.currentTarget.value;
        this.setState({ password });
    };
    onChangeClick = async () => {
        const { token } = this.props.match.params;
        const { password } = this.state;
        const passwordError = validatePassword(password);
        if (passwordError) {
            this.setState({ passwordError });
        } else {
            const res = await requests.changePassword({ token, password });
            if (res.error) {
                this.setState({
                    passwordError: "",
                });
                this.props.setStatus(Status.Error, res.error);
                return;
            }
            this.props.setStatus(
                Status.Success,
                "You successfully changed your password",
            );
            this.setState({
                passwordError: null,
            });
            return;
        }
    };
    render = () => {
        return (
            <Widget>
                <Input
                    label={"Enter new password"}
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                    type={"password"}
                    error={this.state.passwordError}
                />
                <BlockButton onClick={this.onChangeClick}>
                    Change password
                </BlockButton>
            </Widget>
        );
    };
}
export default withRouter(VerifyAccount);
