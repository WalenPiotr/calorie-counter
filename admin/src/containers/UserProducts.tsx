import * as React from "react";
import { Product } from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
import ProductsTable from "@components/ProductsTable";
import UserData from "@components/UserData";

import * as Elements from "@elements/index";
interface Response {
    user?: {
        id: number;
        email: string;
        accessLevel: number;
    };
    products?: Product[];
}

interface UserProductsProps
    extends RouteComponentProps<{
        id: string;
    }> {
    get: (id: number) => Promise<Response | undefined>;
}
interface UserProductsState {
    products: Product[];
    user: {
        id: number;
        email: string;
        accessLevel: number;
    };
}

class UserProducts extends React.PureComponent<
    UserProductsProps,
    UserProductsState
> {
    state = {
        products: [],
        user: {
            id: -1,
            email: "",
            accessLevel: -2
        }
    };
    componentDidMount = async () => {
        const { id } = this.props.match.params;
        const res = await this.props.get(parseInt(id));
        if (res && res.products && res.user) {
            this.setState({ products: res.products, user: res.user });
        }
    };
    goToProduct = (id: number) => () => {
        this.props.history.push(routes.product(id.toString()));
    };
    render() {
        return (
            <Elements.Widget>
                <UserData user={this.state.user} />
                <Elements.TitleBox>Products</Elements.TitleBox>
                <ProductsTable
                    products={this.state.products}
                    goToProduct={this.goToProduct}
                />
            </Elements.Widget>
        );
    }
}

export default withRouter(UserProducts);
