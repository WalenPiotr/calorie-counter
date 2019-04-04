import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
import UsersTable from "@components/UsersTable";
import PaginationControls from "@components/PaginationControls";
import { Pagination, User } from "@requests";

interface UsersProps extends RouteComponentProps {
    search: (
        name: string,
        pagination: Pagination,
    ) => Promise<{ users: User[]; pagination: Pagination } | undefined>;
    ban: (id: number) => Promise<void>;
    unban: (id: number) => Promise<void>;
}
interface UsersState {
    users: User[];
    pagination: Pagination;
}

class Users extends React.PureComponent<UsersProps, UsersState> {
    state = {
        users: [],
        pagination: {
            page: 0,
            maxPage: 0,
            itemsPerPage: 10,
        },
    };
    componentDidMount = () => {
        this.fetchData();
    };
    fetchData = async () => {
        const res = await this.props.search("", this.state.pagination);
        if (res && res.users && res.pagination) {
            this.setState({ ...res });
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
    jumpToPage = async (page: number) => {
        const res = await this.props.search("", {
            ...this.state.pagination,
            page,
        });
        if (res && res.users && res.pagination) {
            this.setState({ ...res });
        }
    };
    render() {
        return (
            <>
                <UsersTable
                    users={this.state.users}
                    goToUserProducts={this.goToUserProducts}
                    ban={this.ban}
                    unban={this.unban}
                />
                <PaginationControls
                    pagination={this.state.pagination}
                    jumpToPage={this.jumpToPage}
                />
            </>
        );
    }
}

export default withRouter(Users);
