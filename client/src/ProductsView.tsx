import * as React from "react";
import styled from "styled-components";
import * as storage from "./storage";
import { Redirect } from "react-router-dom";

interface Portion {
    id: number;
    productID: number;
    unit: string;
    energy: number;
}
interface Product {
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
        const ProductBox = styled.div`
            margin: 50px auto;
        `;
        if (this.state.redirect.newProduct) {
            return <Redirect to="/add-new" />;
        }
        return (
            <ProductBox>
                <SearchBar
                    searchInput={this.state.searchInput}
                    onSearchClick={this.onSearchClick}
                    onSearchInputChange={this.onSearchInputChange}
                />
                <AddNewControls onClick={this.onAddNew} />
                <Table products={this.state.products} />
            </ProductBox>
        );
    }
}

interface TableProps {
    products: Product[];
}
interface TableState {
    collapsed: boolean;
}
class Table extends React.Component<TableProps, TableState> {
    constructor(props: TableProps) {
        super(props);
        this.state = { collapsed: true };
    }
    async componentDidMount() {}

    render() {
        console.log(this.state);
        const components = this.props.products.map((product: Product) => {
            return <Row product={product} key={product.id} />;
        });
        return <div>{components}</div>;
    }
}

interface RowProps {
    product: Product;
}
interface RowState {
    collapsed: boolean;
    quantity: string;
    unit: string;
}
class Row extends React.Component<RowProps, RowState> {
    state = {
        collapsed: true,
        quantity: "1",
        unit: this.props.product.portions[0].unit
    };
    onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        this.setState((prevState: RowState) => ({
            ...prevState,
            quantity: newValue
        }));
    };
    onSelectChange = (e: React.FormEvent<HTMLSelectElement>) => {
        const newValue = e.currentTarget.value;
        this.setState((prevState: RowState) => ({
            ...prevState,
            unit: newValue
        }));
    };
    onCollapseClick = () => {
        this.setState({ collapsed: !this.state.collapsed });
    };
    onAddClick = async () => {
        var portionID = null;
        for (const portion of this.props.product.portions) {
            if (portion.unit == this.state.unit) {
                portionID = portion.id;
                break;
            }
        }
        const token = storage.retrieveToken();
        const request = {
            body: JSON.stringify({
                entry: {
                    productID: this.props.product.id,
                    portionID: portionID,
                    quantity: parseInt(this.state.quantity)
                }
            }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            method: "POST",
            type: "cors"
        };
        console.log(request);
        try {
            const response = await fetch(
                "http://localhost:8080/api/user/entries/create",
                request
            );
            const parsed = await response.json();
            console.log(parsed);
        } catch (err) {
            console.log(err);
        }
    };
    getEnergy = (): number => {
        var portionEnergy = 0;
        for (const portion of this.props.product.portions) {
            if (portion.unit == this.state.unit) {
                portionEnergy = portion.energy;
                break;
            }
        }
        const parsedQuantity = parseFloat(this.state.quantity);
        const quantity = isNaN(parsedQuantity) ? 0 : parsedQuantity;
        return portionEnergy * quantity;
    };
    render() {
        const LineBox = styled.div`
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid black;
            height: 40px;
            padding-left: 5px;
        `;
        const CollapseButton = styled.button`
            height: 40px;
            width: 80px;
            font-size: 30px;
        `;
        const ControlBox = styled.div`
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;
        const Input = styled.input`
            height: 40px;
            width: 90%;
        `;
        const Select = styled.select`
            height: 40px;
            width: 90%;
        `;
        const Label = styled.label`
            margin-top: 10px;
            width: 90%;
            font-weight: 500;
            font-size: 16px;
        `;
        const NutrientLabel = styled.label`
            margin-top: 10px;
            font-size: 16px;
            font-weight: 500;
        `;
        const NutrientValue = styled.label`
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 5px;
        `;
        const AddButton = styled.button`
            width: 90%;
            height: 40px;
            margin-bottom: 10px;
        `;
        const NutrientDiv = styled.div`
            width: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;
        const SmallLabel = styled.label`
            font-size: 12px;
        `;
        return (
            <div key={this.props.product.name}>
                <LineBox>
                    <label>{this.props.product.name}</label>
                    <SmallLabel>
                        Energy:{" "}
                        <label>{this.props.product.portions[0].energy}</label>
                    </SmallLabel>
                    <SmallLabel>
                        Unit:{" "}
                        <label>{this.props.product.portions[0].unit}</label>
                    </SmallLabel>
                    <CollapseButton onClick={this.onCollapseClick}>
                        {this.state.collapsed ? "+" : "-"}
                    </CollapseButton>
                </LineBox>
                <div hidden={this.state.collapsed}>
                    <ControlBox>
                        <Label>Amount</Label>
                        <Input
                            value={this.state.quantity}
                            onChange={this.onInputChange}
                        />
                        <Label>Unit</Label>
                        <Select
                            value={this.state.unit}
                            onChange={this.onSelectChange}
                        >
                            {this.props.product.portions.map(
                                (portion: Portion) => (
                                    <option key={portion.id}>
                                        {portion.unit}
                                    </option>
                                )
                            )}
                        </Select>
                        <NutrientDiv>
                            <NutrientLabel>Calories</NutrientLabel>
                            <NutrientValue>{this.getEnergy()}</NutrientValue>
                        </NutrientDiv>
                        <AddButton onClick={this.onAddClick}>ADD</AddButton>
                    </ControlBox>
                </div>
            </div>
        );
    }
}

interface SearchBarProps {
    onSearchClick: () => void;
    onSearchInputChange: (e: React.FormEvent<HTMLInputElement>) => void;
    searchInput: string;
}
interface SearchBarState {}
class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
    render() {
        const SearchBox = styled.div`
            width: 100%;
            display: flex;
            margin-bottom: 10px;
        `;
        const Input = styled.input`
            box-sizing: border-box;
            flex: 200px 1 1;
            height: 40px;
            padding: 0;
            margin: 0;
            padding-left: 10px;
        `;
        const Button = styled.button`
            flex: 80px 0 1;
            height: 40px;
        `;
        return (
            <SearchBox>
                <Input
                    placeholder="Enter product you are looking for :)"
                    value={this.props.searchInput}
                    onChange={this.props.onSearchInputChange}
                />
                <Button onClick={this.props.onSearchClick}>FIND</Button>
            </SearchBox>
        );
    }
}
interface AddNewControlsProps {
    onClick: () => void;
}
class AddNewControls extends React.Component<AddNewControlsProps, any> {
    render() {
        const Button = styled.button`
            width: 100%;
            height: 40px;
        `;
        return <Button onClick={this.props.onClick}>Add new product</Button>;
    }
}

export default ProductsView;
