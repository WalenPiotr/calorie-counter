import * as React from "react";
import * as Elements from "@elements/index";
import { css } from "styled-components";
import { fonts } from "@theme";
interface UserDataProps {
    user: {
        id: number;
        email: string;
        accessLevel: number;
    };
}

class UserData extends React.PureComponent<UserDataProps> {
    render() {
        return (
            <div>
                <Elements.TitleBox>User</Elements.TitleBox>
                <Elements.ListElement>
                    ID: {this.props.user.id}
                </Elements.ListElement>
                <Elements.ListElement>
                    Name: {this.props.user.email}
                </Elements.ListElement>
                <Elements.ListElement>
                    CreatorID: {this.props.user.accessLevel}
                </Elements.ListElement>
            </div>
        );
    }
}

export default UserData;
