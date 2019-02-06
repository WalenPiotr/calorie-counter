import * as React from "react";
import { Product } from "@requests";
import { css } from "styled-components";
import Table from "@components/Table";
import * as Elements from "@elements/index";
interface ProductsTableProps {
    products: Product[];
    goToProduct: (id: number) => () => void;
}
class ProductsTable extends React.PureComponent<ProductsTableProps> {
    render() {
        const { products } = this.props;
        const heading = new Map<string, React.ReactNode>([
            ["id", "Id"],
            ["name", "Name"],
            ["creator", "Creator"],
            ["edit", ""]
        ]);

        const rows = products.map(
            (product: Product, index: number) =>
                new Map<string, React.ReactNode>([
                    ["id", product.id],
                    ["name", product.name],
                    ["creator", product.creator],
                    [
                        "edit",
                        <Elements.Button
                            onClick={this.props.goToProduct(product.id)}
                            small
                            green
                        >
                            edit
                        </Elements.Button>
                    ]
                ])
        );

        return (
            <Elements.Widget>
                <Table heading={heading} rows={rows} />
            </Elements.Widget>
        );
    }
}
export default ProductsTable;
