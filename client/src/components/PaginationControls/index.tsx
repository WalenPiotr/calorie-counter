import * as React from "react";
import { Pagination } from "@requests";
import ButtonWithIcon from "@components/ButtonWithIcon";
import { ArrowLeft, ArrowRight, Box, Text } from "./styled";
interface PaginationControlsProps {
    pagination: Pagination;
    onJumpPage: (jump: number) => () => void;
}

class PaginationControls extends React.PureComponent<PaginationControlsProps> {
    render() {
        const { pagination, onJumpPage } = this.props;
        console.log("hit pagination controls");
        if (pagination.maxPage) {
            return (
                <Box>
                    <ButtonWithIcon
                        onClick={onJumpPage(-1)}
                        text={"Previous"}
                        icon={<ArrowLeft />}
                        disabled={pagination.page === 0}
                    />
                    <Text>
                        {"Page: "}
                        {pagination.page + 1}
                        {" / "}
                        {pagination.maxPage + 1}
                    </Text>
                    <ButtonWithIcon
                        onClick={onJumpPage(1)}
                        text={"Next"}
                        icon={<ArrowRight />}
                        disabled={pagination.page === pagination.maxPage}
                    />
                </Box>
            );
        } else {
            return null;
        }
    }
}
export default PaginationControls;
