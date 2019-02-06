import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
import UsersTable from "@components/UsersTable";
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
    componentDidMount = () => {
        this.fetchData();
    };
    fetchData = async () => {
        const users = await this.props.search("");
        if (users !== undefined) {
            this.setState({ users });
        }
    };
    goToUserProducts = (userId: number) => () => {
        this.props.history.push(routes.userProducts(userId.toString()));
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
        return (
            <UsersTable
                users={this.state.users}
                goToUserProducts={this.goToUserProducts}
                ban={this.ban}
                unban={this.unban}
            />
        );
    }
}

export default withRouter(Users);
