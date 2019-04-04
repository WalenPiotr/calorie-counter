import * as React from "react";
import * as requests from "@requests";
import styled, { css } from "styled-components";
import { FlexBox } from "@elements/FlexBox";
import { Button } from "@elements/Button";
interface PaginationControlsProps {
    pagination: requests.Pagination;
    jumpToPage: (page: number) => void;
}
class PaginationControls extends React.PureComponent<PaginationControlsProps> {
    next = () => {
        this.props.jumpToPage(this.props.pagination.page + 1);
    };
    prev = () => {
        this.props.jumpToPage(this.props.pagination.page - 1);
    };
    render() {
        const { pagination, jumpToPage } = this.props;
        return (
            <FlexBox
                css={css`
                    width: 200px;
                    justify-content: space-between;
                    align-items: center;
                    margin: 10px auto;
                `}
            >
                <Button green small onClick={this.prev}>
                    prev
                </Button>
                {pagination.page} / {pagination.maxPage}
                <Button green small onClick={this.next}>
                    next
                </Button>
            </FlexBox>
        );
    }
}
export default PaginationControls;
