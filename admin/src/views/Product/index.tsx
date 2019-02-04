import * as React from "react";
import * as requests from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";

interface ProductsProps extends RouteComponentProps {
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
        const { id } = this.props.location.state;
        const product = await this.props.get(id);
        if (product !== undefined) {
            this.setState({ product, isLoading: false });
        }
    };
    onDeleteClick = async () => {
        this.props.delete(this.state.product.id);
        this.props.history.push(routes.products);
    };
    onUpdateClick = async () => {
        this.props.history.push(routes.productUpdate, {
            product: this.state.product
        });
    };
    render() {
        console.log(this.state);
        if (!this.state.isLoading) {
            const { product } = this.state;
            return (
                <div>
                    {product.id} - {product.name}- {product.creator}
                    <button onClick={this.onDeleteClick}>DELETE</button>
                    <button onClick={this.onUpdateClick}>UPDATE</button>
                </div>
            );
        } else {
            return <div>loading...</div>;
        }
    }
}

export default withRouter(Product);
