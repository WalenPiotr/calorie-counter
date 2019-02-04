import * as React from "react";
import { Product } from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
interface ProductsProps extends RouteComponentProps {
    search: (name: string) => Promise<Product[] | undefined>;
}
interface ProductsState {
    products: Product[];
}

class Products extends React.PureComponent<ProductsProps, ProductsState> {
    state = {
        products: []
    };
    componentDidMount = async () => {
        const products = await this.props.search("");
        if (products !== undefined) {
            this.setState({ products });
        }
    };

    goToProduct = (id: number) => () => {
        this.props.history.push(routes.product, { id });
    };
    goToNew = () => () => {
        this.props.history.push(routes.productNew);
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
                <div>
                    <button onClick={this.goToNew}>Add new</button>
                </div>
            </div>
        );
    }
}

export default withRouter(Products);
