import * as React from "react";
import Widget from "@components/Widget";
import Calendar from "@components/Calendar";
import * as requests from "@requests";
import Spinner from "@elements/Spinner";
import { Status } from "@status";
import Row from "./Row";
import * as Styled from "./styled";
import PaginationControls from "@components/PaginationControls";

export interface Entry {
    id: number;
    userID: number;
    productID: number;
    portionID: number;
    quantity: number;
    date: string;
    product: Product;
}
export interface Portion {
    id: number;
    productID: number;
    unit: string;
    energy: number;
}
export interface Product {
    id: number;
    name: string;
    creator: number;
    portions: Portion[];
}

interface EntriesState {
    entries: Entry[];
    loggedDates: Date[];
    date: Date;
    isLoading: boolean;
    pagination: requests.Pagination;
}
interface EntriesProps {
    setStatus: (status: Status, message: string) => void;
}

class Entries extends React.Component<EntriesProps, EntriesState> {
    state = {
        entries: [],
        date: new Date(),
        loggedDates: [],
        isLoading: false,
        pagination: {
            itemsPerPage: 5,
            page: 1,
            maxPage: 1,
        },
    };
    componentDidMount = () => {
        this.fetchData();
    };
    onDateChange = async (date: Date) => {
        await this.setState((prevState: EntriesState) => ({
            ...prevState,
            isLoading: true,
            date,
        }));
        this.props.setStatus(Status.None, "");
        this.fetchData();
    };
    fetchData = async () => {
        await this.setState((prevState: EntriesState) => ({
            ...prevState,
            isLoading: true,
        }));
        const date = this.state.date.toISOString();
        const resView = await requests.entriesView({
            date,
            pagination: this.state.pagination,
        });
        if (resView.error) {
            this.props.setStatus(Status.Error, resView.error);
            this.setState({ isLoading: false });
            return;
        }
        const resDates = await requests.getDates();
        if (resDates.error) {
            this.props.setStatus(Status.Error, resDates.error);
            this.setState({ isLoading: false });
            return;
        }
        if (resDates.dates !== undefined && resView.entries !== undefined) {
            this.setState({
                loggedDates: resDates.dates.map((val: string) => new Date(val)),
                entries: resView.entries,
                isLoading: false,
            });
            return;
        }
        this.setState({ isLoading: false });
    };

    updateEntry = async (id: number, entry: any) => {
        try {
            await this.setState((prevState: EntriesState) => ({
                ...prevState,
                isLoading: true,
            }));
            const res = await requests.updateEntry({ id, entry });
            if (res.error) {
                this.props.setStatus(Status.Error, res.error);
                return;
            }
            await this.fetchData();
            this.props.setStatus(Status.Success, "Entry successfully updated");
        } catch (e) {
            this.props.setStatus(Status.Error, "Something went wrong");
            console.log(e);
        }
        this.setState({ isLoading: false });
    };

    deleteEntry = async (id: number) => {
        try {
            await this.setState((prevState: EntriesState) => ({
                ...prevState,
                isLoading: true,
            }));
            const res = await requests.deleteEntry({ id });
            if (res.error) {
                this.props.setStatus(Status.Error, res.error);
                return;
            }
            await this.fetchData();
            this.props.setStatus(Status.Success, "Entry successfully deleted");
        } catch (e) {
            this.props.setStatus(Status.Error, "Something went wrong");
            console.log(e);
        }
        this.setState({ isLoading: false });
    };

    onCalendarClick = () => {
        this.props.setStatus(Status.None, "");
    };
    onJumpPage = (jump: number) => async () => {
        await this.setState((prevState: EntriesState) => {
            if (prevState.pagination.maxPage) {
                const newPage = prevState.pagination.page + jump;
                console.log(newPage);
                if (newPage < 0 || newPage > prevState.pagination.maxPage) {
                    return prevState;
                } else {
                    return {
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            page: newPage,
                        },
                    };
                }
            }
            return prevState;
        });
        this.fetchData();
    };
    render() {
        const rows =
            this.state.entries.length == 0 ? (
                <div>Nothing found</div>
            ) : (
                this.state.entries
                    .sort((a: Entry, b: Entry) => a.id - b.id)
                    .map((entry: Entry) => {
                        return (
                            <Row
                                setStatus={this.props.setStatus}
                                updateEntry={this.updateEntry}
                                deleteEntry={this.deleteEntry}
                                key={entry.id}
                                entry={entry}
                                loggedDates={this.state.loggedDates}
                            />
                        );
                    })
            );

        const sum = this.state.entries.reduce((acc: number, entry: Entry) => {
            const portion = entry.product.portions.find(
                (portion: Portion) => portion.id == entry.portionID,
            );
            if (portion) {
                return acc + entry.quantity * portion.energy;
            }
            return 0;
        }, 0);

        const toRender = !this.state.isLoading ? (
            <Styled.TableBox>
                <div>{rows}</div>
                <Styled.SummaryBox>
                    <Styled.SummaryLabel>Total energy: </Styled.SummaryLabel>
                    <Styled.SummaryValue>
                        {sum.toFixed()} kcal
                    </Styled.SummaryValue>
                </Styled.SummaryBox>
            </Styled.TableBox>
        ) : (
            <Styled.SpinnerBox>
                <Spinner />
            </Styled.SpinnerBox>
        );
        return (
            <Widget>
                <Styled.Label>Entries</Styled.Label>
                <Styled.CalendarBox>
                    <Calendar
                        date={this.state.date}
                        logged={this.state.loggedDates}
                        onDateChange={this.onDateChange}
                        onCollapseClick={this.onCalendarClick}
                    />
                </Styled.CalendarBox>
                {toRender}
            </Widget>
        );
    }
}

export default Entries;
