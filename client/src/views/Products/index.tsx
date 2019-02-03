import * as React from "react";
import styled from "styled-components";

import SearchBar from "./SearchBar";
import AddNewControls from "./AddNewControls";
import Table from "./Table";

import * as storage from "@storage";
import Widget from "@elements/Widget";
import Label from "@elements/Label";
import * as requests from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Spinner from "@elements/Spinner";
import { Status } from "@status";
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

export interface ProductsProps extends RouteComponentProps {
    setStatus: (status: Status, message: string) => void;
}
interface ProductsState {
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

class Products extends React.PureComponent<ProductsProps, ProductsState> {
    state = {
        searchInput: "",
        products: [],
        isLoading: false
    };
    onSearchClick = async () => {
        this.setState((prevState: ProductsState) => ({
            ...prevState,
            isLoading: true
        }));
        const res = await requests.searchProducts({
            name: this.state.searchInput
        });
        const products = res.products;
        if (products) {
            this.setState((prevState: ProductsState) => ({
                ...prevState,
                products: products,
                isLoading: false
            }));
            return;
        }
        if (res.error) {
            this.props.setStatus(Status.Error, res.error);
            this.setState((prevState: ProductsState) => ({
                ...prevState,
                isLoading: false
            }));
            return;
        }
        return;
    };
    onSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        this.setState((prevState: ProductsState) => ({
            ...prevState,
            searchInput: newValue
        }));
    };
    onAddNew = () => {
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
                        <Table
                            products={this.state.products}
                            setStatus={this.props.setStatus}
                        />
                    )}
                    <AddNewControls onClick={this.onAddNew} />
                </Box>
            </Widget>
        );
    }
}

export default withRouter(Products);
