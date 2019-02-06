import * as React from "react";
import * as Elements from "@elements/index";
import { Product } from "@requests";
import styled, { css } from "styled-components";

interface ProductViewProps {
    product: Product;
    onDeleteClick: () => void;
    onUpdateClick: () => void;
}

class ProductView extends React.PureComponent<ProductViewProps> {
    render() {
        const { product } = this.props;
        return (
            <Elements.Widget>
                <Elements.TitleBox>Product</Elements.TitleBox>
                <Elements.ListElement>ID: {product.id}</Elements.ListElement>
                <Elements.ListElement>
                    Name: {product.name}
                </Elements.ListElement>
                <Elements.ListElement>
                    CreatorID: {product.creator}
                </Elements.ListElement>
                <Elements.FlexBox
                    css={css`
                        width: 100%;
                        justify-content: space-between;
                        margin-top: 10px;
                    `}
                >
                    <Elements.Button red onClick={this.props.onDeleteClick}>
                        DELETE
                    </Elements.Button>
                    <Elements.Button green onClick={this.props.onUpdateClick}>
                        UPDATE
                    </Elements.Button>
                </Elements.FlexBox>
            </Elements.Widget>
        );
    }
}

export default ProductView;
