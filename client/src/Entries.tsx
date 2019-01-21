import * as React from "react";
import * as storage from "./storage";

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
            <div>
                {this.state.entries.map((entry: Entry) => {
                    const name = entry.product.name;
                    const quantity = entry.quantity;
                    const portion = findPortion(
                        entry.product.portions,
                        entry.portionID
                    );
                    const energy = portion.energy * quantity;
                    const unit = portion.unit;
                    return (
                        <div key={entry.id}>
                            {name} - {quantity} x {unit} = {energy} kcal
                        </div>
                    );
                })}
            </div>
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
