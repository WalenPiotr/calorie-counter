import * as React from "react";
import styled from "styled-components";
import { Redirect } from "react-router-dom";

import SearchBar from "./SearchBar";
import AddNewControls from "./AddNew";
import Table from "./Table";

import * as storage from "@storage";
import Widget from "@elements/Widget";
import Label from "@elements/Label";
import * as requests from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Spinner from "@elements/Spinner";

export interface Portion {
    id: number;
    productID: number;
    unit: string;
    energy: number;
}
export interface Product {
    id: number;
    name: string;
    creator: number;
    portions: Portion[];
}

interface ProductViewProps extends RouteComponentProps {}
interface ProductViewState {
    searchInput: string;
    products: Product[];
    isLoading: boolean;
}

const Box = styled.div`
    flex: 100px 1 1;
    margin: 10px;
    width: 85%;
`;
const SpinnerBox = styled.div`
    width: 50px;
    height: 50px;
    color: rgba(30, 100, 200, 1);
    margin: 10px auto;
`;

class ProductsView extends React.Component<ProductViewProps, ProductViewState> {
    state = {
        searchInput: "",
        products: [],
        isLoading: false
    };
    onSearchClick = async () => {
        try {
            this.setState((prevState: ProductViewState) => ({
                ...prevState,
                products: products,
                isLoading: true
            }));
            const products = await requests.searchProducts(
                this.state.searchInput
            );
            this.setState((prevState: ProductViewState) => ({
                ...prevState,
                products: products,
                isLoading: false
            }));
        } catch (e) {
            console.log(e);
        }
    };
    onSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        this.setState((prevState: ProductViewState) => ({
            ...prevState,
            searchInput: newValue
        }));
    };
    onAddNew = () => {
        console.log("redirect to add new");
        this.props.history.push("/products/new");
    };
    render() {
        return (
            <Widget>
                <Box>
                    <Label>Products</Label>
                    <SearchBar
                        searchInput={this.state.searchInput}
                        onSearchClick={this.onSearchClick}
                        onSearchInputChange={this.onSearchInputChange}
                    />
                    {this.state.isLoading ? (
                        <SpinnerBox>
                            <Spinner />
                        </SpinnerBox>
                    ) : (
                        <Table products={this.state.products} />
                    )}
                    <AddNewControls onClick={this.onAddNew} />
                </Box>
            </Widget>
        );
    }
}

export default withRouter(ProductsView);
