import * as React from "react";
import * as storage from "./storage";
import styled from "styled-components";
import Widget from "./elements/Widget";
import { ChevronDown } from "styled-icons/fa-solid/ChevronDown";
import { ChevronUp } from "styled-icons/fa-solid/ChevronUp";
import { TrashAlt } from "styled-icons/boxicons-regular/TrashAlt";
interface Entry {
    id: number;
    userID: number;
    productID: number;
    portionID: number;
    quantity: number;
    date: string;
    product: Product;
}
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

const Label = styled.div`
    width: 85%;
    color: grey;
    font-size: 24px;
    text-transform: uppercase;
    border-bottom: 1px solid grey;
    box-sizing: border-box;
    padding: 5px;
    padding-bottom: 15px;
    margin-bottom: 15px;
`;

interface EntriesState {
    entries: Entry[];
}
interface EntriesProps {}

class Entries extends React.Component<EntriesProps, EntriesState> {
    state = {
        entries: []
    };
    componentDidMount = async () => {
        const token = storage.retrieveToken();
        const request = {
            body: JSON.stringify({}),
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
                "http://localhost:8080/api/user/entries/view",
                request
            );
            const parsed = await response.json();
            console.log(parsed);
            this.setState((prevState: EntriesState) => ({
                ...prevState,
                entries: parsed.entries
            }));
        } catch (err) {
            console.log(err);
        }
    };

    render() {
        return (
            <Widget>
                <Label>Entries</Label>
                {this.state.entries.map((entry: Entry) => {
                    return <Row entry={entry} />;
                })}
            </Widget>
        );
    }
}

interface ElementProps {
    width: string;
}

const RowBox = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    height: 50px;
    border-bottom: 1px solid grey;
    width: 85%;
`;
const Element = styled.div`
    width: ${(props: ElementProps) => props.width};
    text-align: left;
    vertical-align: middle;
`;
const ExpandButton = styled.button`
    width: 50px;
    height: 50px;
    background-color: none;
    color: red;
    border: none;
    background-color: transparent;
    height: 50px;
    width: 50px;
    padding: 10px;
    font-size: 20px;
`;

interface RowProps {
    entry: Entry;
}
interface RowState {
    collapsed: boolean;
}

class Row extends React.Component<RowProps, RowState> {
    state = {
        collapsed: true,
        quantity: this.props.entry.quantity
    };
    render() {
        const { entry } = this.props;
        const id = entry.id;
        const name = entry.product.name;
        const quantity = entry.quantity;
        const portion = findPortion(entry.product.portions, entry.portionID);
        const energy = portion.energy * quantity;
        const unit = portion.unit;
        return (
            <RowBox key={id}>
                <Element width={"35%"}>{name}</Element>
                <Element width={"10%"}>{quantity}</Element>
                <Element width={"15%"}>{unit}</Element>
                <Element width={"30%"}>{energy} kcal</Element>
                <ExpandButton />
            </RowBox>
        );
    }
}

const findPortion = (portions: Portion[], portionID: number) => {
    portions.filter((portion: Portion) => {
        return portion.id == portionID;
    });
    return portions[0];
};

export default Entries;
