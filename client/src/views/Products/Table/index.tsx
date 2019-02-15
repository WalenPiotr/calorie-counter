import * as React from "react";

import { Product } from "..";
import Row from "./Row";
import { Status } from "@status";

interface TableProps {
    products: Product[];
    setStatus: (status: Status, message: string) => void;
    nothingFound: boolean;
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
                />
            );
        });
        if (this.props.nothingFound) {
            return <div>Nothing Found</div>;
        }
        return <div>{components}</div>;
    }
}

export default Table;
