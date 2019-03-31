import * as React from "react";
import styled from "styled-components";
import SearchBar from "./SearchBar";
import AddNewControls from "./AddNewControls";
import Table from "./Table";
import Widget from "@components/Widget";
import Label from "@elements/Label";
import * as requests from "@requests";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Spinner from "@elements/Spinner";
import { Status } from "@status";
import PaginationControls from "@components/PaginationControls";

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
    ratings: {
        userID: number;
        vote: number;
    }[];
}

export interface ProductsProps extends RouteComponentProps {
    setStatus: (status: Status, message: string) => void;
}
interface ProductsState {
    searchInput: string;
    products: Product[];
    isLoading: boolean;
    nothingFound: boolean;
    userID: number;
    pagination: requests.Pagination;
}

const Box = styled.div`
    flex: 100px 1 1;
    margin: 10px;
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
        isLoading: false,
        nothingFound: false,
        userID: -1,
        pagination: {
            itemsPerPage: 8,
            page: 0,
            maxPage: 0,
        },
    };
    search = async () => {
        this.setState((prevState: ProductsState) => ({
            ...prevState,
            isLoading: true,
        }));
        const res = await requests.searchProducts({
            name: this.state.searchInput,
            pagination: this.state.pagination,
        });
        const products = res.products;
        const userID = res.userID;
        const pagination = res.pagination;
        if (products && userID && pagination) {
            this.setState((prevState: ProductsState) => ({
                ...prevState,
                products: products,
                isLoading: false,
                nothingFound: false,
                userID,
                pagination,
            }));
        } else {
            this.setState((prevState: ProductsState) => ({
                ...prevState,
                products: [],
                isLoading: false,
                nothingFound: true,
                pagination: {
                    ...prevState.pagination,
                    page: 0,
                    maxPage: 0,
                },
            }));
        }
        if (res.error) {
            this.props.setStatus(Status.Error, res.error);
            this.setState((prevState: ProductsState) => ({
                ...prevState,
                isLoading: false,
                nothingFound: true,
                pagination: {
                    ...prevState.pagination,
                    page: 0,
                    maxPage: 0,
                },
            }));
            return;
        }
        return;
    };
    onSearchClick = () => {
        this.search();
    };
    onSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        this.setState((prevState: ProductsState) => ({
            ...prevState,
            searchInput: newValue,
        }));
    };
    onAddNew = () => {
        this.props.history.push("/products/new");
    };
    onJumpPage = (jump: number) => async () => {
        await this.setState((prevState: ProductsState) => {
            if (prevState.pagination.maxPage) {
                const newPage = prevState.pagination.page + jump;
                console.log(newPage);
                if (newPage < 0 || newPage > prevState.pagination.maxPage) {
                    return prevState;
                } else {
                    return {
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            page: newPage,
                        },
                    };
                }
            }
            return prevState;
        });
        this.search();
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
                            nothingFound={this.state.nothingFound}
                            products={this.state.products}
                            setStatus={this.props.setStatus}
                            userID={this.state.userID}
                        />
                    )}
                    <PaginationControls
                        pagination={this.state.pagination}
                        onJumpPage={this.onJumpPage}
                    />
                    <AddNewControls onClick={this.onAddNew} />
                </Box>
            </Widget>
        );
    }
}

export default withRouter(Products);
