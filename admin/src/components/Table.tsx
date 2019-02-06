import * as React from "react";
import * as Elements from "@elements/index";

interface TableProps {
    heading: Map<string, React.ReactNode>;
    rows: Map<string, React.ReactNode>[];
}

class Table extends React.PureComponent<TableProps> {
    render() {
        const heading = (
            <Elements.Tr>
                {Array.from(this.props.heading.entries()).map(
                    ([key, value]: [string, React.ReactNode]) => (
                        <Elements.Th key={key}>{value}</Elements.Th>
                    )
                )}
            </Elements.Tr>
        );
        const rows = this.props.rows.map(
            (map: Map<string, React.ReactNode>, index: number) => (
                <Elements.Tr key={index}>
                    {Array.from(map.entries()).map(
                        ([key, value]: [string, React.ReactNode]) => (
                            <Elements.Td key={key}>{value}</Elements.Td>
                        )
                    )}
                </Elements.Tr>
            )
        );
        return (
            <Elements.Table>
                <thead>{heading}</thead>
                <tbody>{rows}</tbody>
            </Elements.Table>
        );
    }
}
export default Table;
