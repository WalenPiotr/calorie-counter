import * as React from "react";
import styled from "styled-components";
import Input from "@components/Input";
import BlockButton from "@elements/BlockButton";
import Widget from "@components/Widget";
import * as requests from "@requests";
import { validateEmail } from "@inputValidation";
import { Status } from "@status";

interface RemindPasswordProps {
    setStatus: (status: Status, message: string) => void;
}
interface RemindPasswordState {
    email: string;
    emailError: string | null;
    failed: boolean;
    loading: boolean;
}

class RemindPassword extends React.PureComponent<
    RemindPasswordProps,
    RemindPasswordState
> {
    state = {
        email: "",
        emailError: null,
        failed: false,
        loading: true,
    };
    handlePasswordChange = (event: React.FormEvent<HTMLInputElement>) => {
        const email = event.currentTarget.value;
        this.setState({ email });
    };
    onChangeClick = async () => {
        const { email } = this.state;
        const emailError = validateEmail(email);
        if (emailError) {
            this.setState({ emailError });
        } else {
            const res = await requests.remindPassword({ email });
            if (res.error) {
                this.setState({
                    emailError: "",
                });
                this.props.setStatus(Status.Error, res.error);
                return;
            }
            this.props.setStatus(Status.Success, "Please check your email box");
            this.setState({
                emailError: null,
            });
            return;
        }
    };
    render = () => {
        return (
            <Widget>
                <Input
                    label={"Enter your email"}
                    value={this.state.email}
                    onChange={this.handlePasswordChange}
                    type={"email"}
                />
                <BlockButton onClick={this.onChangeClick}>
                    Remind password
                </BlockButton>
            </Widget>
        );
    };
}
export default RemindPassword;
