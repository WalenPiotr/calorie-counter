import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";

interface User {
    email: string;
    id: number;
    accessLevel: number;
}

interface UsersProps extends RouteComponentProps {
    search: (name: string) => Promise<User[] | undefined>;
}
interface UsersState {
    users: User[];
}

class Users extends React.PureComponent<UsersProps, UsersState> {
    state = {
        users: []
    };
    componentDidMount = async () => {
        const users = await this.props.search("");
        if (users !== undefined) {
            this.setState({ users });
        }
    };
    goToUsersProduct = (id: number) => () => {
        this.props.history.push(routes.user, { id });
    };
    ban = (id: number) => () => {};
    unban = (id: number) => () => {};
    render() {
        const usersElements = this.state.users.map((user: User) => (
            <div>
                {user.id} - {user.email} - {user.accessLevel} -{" "}
                <button onClick={}>BAN</button>
            </div>
        ));
        return (
            <div>
                <div>{usersElements}</div>
            </div>
        );
    }
}

export default withRouter(Users);
