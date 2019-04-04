import * as React from "react";
import { Product, Pagination } from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { routes } from "@routes";
import ProductsTable from "@components/ProductsTable";
import PaginationControls from "@components/PaginationControls";
import * as Elements from "@elements/index";
import * as requests from "@requests";
interface ProductsProps extends RouteComponentProps {
    search: (
        name: string,
        pagination: Pagination,
    ) => Promise<{ products: Product[]; pagination: Pagination } | undefined>;
}
interface ProductsState {
    products: Product[];
    pagination: requests.Pagination;
}
class Products extends React.Component<ProductsProps, ProductsState> {
    state: ProductsState = {
        products: [],
        pagination: {
            itemsPerPage: 10,
            page: 0,
            maxPage: 1,
        },
    };
    componentDidMount = async () => {
        const payload = await this.props.search("", this.state.pagination);
        if (payload && payload.products && payload.pagination) {
            this.setState({
                products: payload.products,
                pagination: payload.pagination,
            });
        }
    };
    goToProduct = (id: number) => () => {
        this.props.history.push(routes.product(id.toString()));
    };
    goToNew = () => () => {
        this.props.history.push(routes.productNew());
    };
    jumpToPage = async (page: number) => {
        console.log(page);
        if (
            page >= 0 &&
            this.state.pagination.maxPage &&
            page <= this.state.pagination.maxPage
        ) {
            const payload = await this.props.search("", {
                ...this.state.pagination,
                page,
            });
            console.log(payload);
            if (payload && payload.products && payload.pagination) {
                this.setState({
                    products: payload.products,
                    pagination: payload.pagination,
                });
            }
        }
    };
    render() {
        return (
            <Elements.Widget>
                <ProductsTable
                    products={this.state.products}
                    goToProduct={this.goToProduct}
                />
                <PaginationControls
                    pagination={this.state.pagination}
                    jumpToPage={this.jumpToPage}
                />
            </Elements.Widget>
        );
    }
}

export default withRouter(Products);
