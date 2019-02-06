import * as React from "react";
import { Product } from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
import ProductsTable from "@components/ProductsTable";

interface UserProductsProps
    extends RouteComponentProps<{
        id: string;
    }> {
    get: (id: number) => Promise<Product[] | undefined>;
}
interface UserProductsState {
    products: Product[];
}

class UserProducts extends React.PureComponent<
    UserProductsProps,
    UserProductsState
> {
    state = {
        products: []
    };
    componentDidMount = async () => {
        const { id } = this.props.match.params;
        const products = await this.props.get(parseInt(id));
        if (products !== undefined) {
            this.setState({ products });
        }
    };
    goToProduct = (id: number) => () => {
        this.props.history.push(routes.product(id.toString()));
    };
    render() {
        return (
            <ProductsTable
                products={this.state.products}
                goToProduct={this.goToProduct}
            />
        );
    }
}

export default withRouter(UserProducts);
