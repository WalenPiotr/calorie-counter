import * as React from "react";
import styled from "styled-components";
import { Redirect } from "react-router-dom";

import SearchBar from "./SearchBar/SearchBar";
import AddNewControls from "./AddNew/AddNew";
import Table from "./Table/Table";

import * as storage from "@storage";
import Widget from "@elements/Widget";
import Label from "@elements/Label";

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

interface ProductViewProps {}
interface ProductViewState {
    searchInput: string;
    products: Product[];
    redirect: {
        newProduct: boolean;
    };
}

const Box = styled.div`
    flex: 100px 1 1;
    margin: 10px;
    width: 85%;
`;
class ProductsView extends React.Component<ProductViewProps, ProductViewState> {
    state = {
        searchInput: "",
        products: [],
        redirect: {
            newProduct: false
        }
    };
    onSearchClick = async () => {
        const token = storage.retrieveToken();
        const request = {
            body: JSON.stringify({
                name: this.state.searchInput
            }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            method: "POST",
            type: "cors"
        };
        try {
            const response = await fetch(
                "http://localhost:8080/api/product/search",
                request
            );
            const parsed = await response.json();
            console.log(parsed);
            this.setState((prevState: ProductViewState) => ({
                ...prevState,
                products: parsed.products
            }));
        } catch (err) {
            console.log(err);
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
        this.setState((prevState: ProductViewState) => ({
            ...prevState,
            redirect: { ...prevState.redirect, newProduct: true }
        }));
    };
    render() {
        if (this.state.redirect.newProduct) {
            return <Redirect to="/add-new" />;
        }
        return (
            <Widget>
                <Box>
                    <Label>Products</Label>
                    <SearchBar
                        searchInput={this.state.searchInput}
                        onSearchClick={this.onSearchClick}
                        onSearchInputChange={this.onSearchInputChange}
                    />
                    <Table products={this.state.products} />
                    <AddNewControls onClick={this.onAddNew} />
                </Box>
            </Widget>
        );
    }
}

export default ProductsView;
