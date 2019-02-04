import * as React from "react";
import { Product } from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";

interface UserProductsProps extends RouteComponentProps {
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
        const { id } = this.props.location.state;
        const products = await this.props.get(id);
        if (products !== undefined) {
            this.setState({ products });
        }
    };
    goToProduct = (id: number) => () => {
        this.props.history.push(routes.product, { id });
    };
    render() {
        const productsElements = this.state.products.map((product: Product) => (
            <div onClick={this.goToProduct(product.id)}>
                {product.id} - {product.name} - {product.creator}
            </div>
        ));
        return (
            <div>
                <div>{productsElements}</div>
            </div>
        );
    }
}

export default withRouter(UserProducts);
