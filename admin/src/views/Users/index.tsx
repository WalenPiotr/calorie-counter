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
    ban: (id: number) => Promise<void>;
    unban: (id: number) => Promise<void>;
}
interface UsersState {
    users: User[];
}

class Users extends React.PureComponent<UsersProps, UsersState> {
    state = {
        users: []
    };
    fetchData = async () => {
        const users = await this.props.search("");
        if (users !== undefined) {
            this.setState({ users });
        }
    };

    componentDidMount = () => {
        this.fetchData();
    };

    goToUserProducts = (id: number) => () => {
        this.props.history.push(routes.userProducts, { id });
    };
    ban = (id: number) => async () => {
        await this.props.ban(id);
        this.fetchData();
    };
    unban = (id: number) => async () => {
        await this.props.unban(id);
        this.fetchData();
    };
    render() {
        const usersElements = this.state.users.map((user: User) => (
            <div onClick={this.goToUserProducts(user.id)}>
                {user.id} - {user.email} - {user.accessLevel} -{" "}
                <button onClick={this.ban(user.id)}>BAN</button>
                <button onClick={this.unban(user.id)}>UNBAN</button>
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
