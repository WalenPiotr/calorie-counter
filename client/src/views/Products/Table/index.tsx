import * as React from "react";

import { Product } from "..";
import Row from "./Row";
import { Status } from "@status";
import { TableBox } from "./styled";
interface TableProps {
    products: Product[];
    setStatus: (status: Status, message: string) => void;
    nothingFound: boolean;
    userID: number;
}
interface TableState {
    collapsed: boolean;
}
class Table extends React.PureComponent<TableProps, TableState> {
    constructor(props: TableProps) {
        super(props);
        this.state = { collapsed: true };
    }
    render() {
        const components = this.props.products.map((product: Product) => {
            return (
                <Row
                    product={product}
                    key={product.id}
                    setStatus={this.props.setStatus}
                    userID={this.props.userID}
                    mealID={0}
                />
            );
        });
        if (this.props.nothingFound) {
            return <TableBox>Nothing Found</TableBox>;
        }
        return <TableBox>{components}</TableBox>;
    }
}

export default Table;
