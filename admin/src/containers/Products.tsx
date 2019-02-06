import * as React from "react";
import { Product } from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
import ProductsTable from "@components/ProductsTable";

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
        this.props.history.push(routes.product(id.toString()));
    };
    goToNew = () => () => {
        this.props.history.push(routes.productNew());
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

export default withRouter(Products);
