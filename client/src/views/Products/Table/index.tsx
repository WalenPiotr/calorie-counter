import * as React from "react";

import { Product } from "..";
import Row from "./Row";
import { Status } from "@status";

interface TableProps {
    products: Product[];
    setStatus: (status: Status, message: string) => void;
}
interface TableState {
    collapsed: boolean;
}
class Table extends React.PureComponent<TableProps, TableState> {
    constructor(props: TableProps) {
        super(props);
        this.state = { collapsed: true };
    }
    async componentDidMount() {}

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
        return <div>{components}</div>;
    }
}

export default Table;
