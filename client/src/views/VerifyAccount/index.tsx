import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as requests from "@requests";
import styled from "styled-components";
import Widget from "@components/Widget";
import Spinner from "@elements/Spinner";

interface VerifyAccountProps extends RouteComponentProps<{ token: string }> {}
interface VerifyAccountState {
    isLoading: boolean;
    failed: boolean;
}

const SpinnerBox = styled.div`
    width: 15%;
    margin: 20px auto;
`;

class VerifyAccount extends React.Component<
    VerifyAccountProps,
    VerifyAccountState
> {
    state = { isLoading: true, failed: false };
    componentDidMount = async () => {
        const { token } = this.props.match.params;
        const res = await requests.verifyAccount({ token });
        if (res.error) {
            this.setState({ failed: true, isLoading: false });
            return;
        }
        this.setState({ failed: false, isLoading: false });
        return;
    };
    render = () => {
        const { isLoading, failed } = this.state;
        if (isLoading) {
            return (
                <Widget>
                    <div>Verifying your account...</div>
                    <SpinnerBox>
                        <Spinner />
                    </SpinnerBox>
                </Widget>
            );
        }
        if (failed) {
            return <Widget>Verification process failed</Widget>;
        }
        return <Widget>Your account has been verified</Widget>;
    };
}
export default withRouter(VerifyAccount);
