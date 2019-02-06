import * as React from "react";
import * as Elements from "@elements/index";
import Table from "@components/Table";
interface UserTableProps {
    users: {
        email: string;
        id: number;
        accessLevel: number;
    }[];
    goToUserProducts: (id: number) => () => void;
    ban: (id: number) => () => void;
    unban: (id: number) => () => void;
}
class UsersTable extends React.PureComponent<UserTableProps> {
    render() {
        const { users } = this.props;
        const heading = new Map<string, React.ReactNode>([
            ["id", "Id"],
            ["email", "Email"],
            ["accessLevel", "Access Level"],
            ["products", ""],
            ["ban", ""]
        ]);

        const rows = users.map(
            (user, index) =>
                new Map<string, React.ReactNode>([
                    ["id", user.id],
                    ["email", user.email],
                    ["accessLevel", user.accessLevel],
                    [
                        "products",
                        <Elements.Button
                            onClick={this.props.goToUserProducts(user.id)}
                            small
                        >
                            products
                        </Elements.Button>
                    ],
                    [
                        "ban",
                        <Elements.Button
                            onClick={
                                user.accessLevel == -1
                                    ? this.props.unban(user.id)
                                    : this.props.ban(user.id)
                            }
                            small
                            red={user.accessLevel != -1}
                            green={user.accessLevel == -1}
                        >
                            {user.accessLevel == -1 ? "unban" : "ban"}
                        </Elements.Button>
                    ]
                ])
        );

        return (
            <Elements.Widget>
                <Table heading={heading} rows={rows} />
            </Elements.Widget>
        );
    }
}
export default UsersTable;
