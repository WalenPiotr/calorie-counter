import * as React from "react";

import { Product } from "..";
import Row from "./Row";

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
        const components = this.props.products.map((product: Product) => {
            return <Row product={product} key={product.id} />;
        });
        return <div>{components}</div>;
    }
}

export default Table;
