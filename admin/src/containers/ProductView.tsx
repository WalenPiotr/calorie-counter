import * as React from "react";
import * as requests from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
import ProductView from "@components/ProductView";

interface ProductsProps extends RouteComponentProps<{ id: string }> {
    get: (id: number) => Promise<requests.Product | undefined>;
    delete: (id: number) => Promise<void>;
}
interface ProductsState {
    product?: requests.Product;
    isLoading: boolean;
}

class Product extends React.PureComponent<ProductsProps, ProductsState> {
    state = {
        product: {
            name: "Invalid Name",
            id: -1,
            creator: -1,
            portions: []
        },
        isLoading: true
    };
    componentDidMount = async () => {
        const { id } = this.props.match.params;
        const product = await this.props.get(parseInt(id));
        if (product !== undefined) {
            this.setState({ product, isLoading: false });
        }
    };
    onDeleteClick = async () => {
        this.props.delete(this.state.product.id);
        this.props.history.push(routes.products());
    };
    onUpdateClick = async () => {
        this.props.history.push(
            routes.productUpdate(this.state.product.id.toString())
        );
    };
    render() {
        if (!this.state.isLoading) {
            return (
                <ProductView
                    product={this.state.product}
                    onDeleteClick={this.onDeleteClick}
                    onUpdateClick={this.onUpdateClick}
                />
            );
        } else {
            return <div>loading...</div>;
        }
    }
}

export default withRouter(Product);
