import * as React from "react";
import * as helpers from "./helpers";
import * as Styled from "./styles";
interface CalendarProps {
    logged: Date[];
    date: Date;
    onDateChange: (newDate: Date) => void;
}
interface CalendarState {
    visible: boolean;
}
class Calendar extends React.Component<CalendarProps, CalendarState> {
    state = { visible: false };
    inLogged(date: Date): boolean {
        for (const l of this.props.logged) {
            const ok = helpers.compareDate(date, l);
            if (ok) {
                return true;
            }
        }
        return false;
    }
    onCellClick = (val: Date) => async () => {
        await this.props.onDateChange(val);
        this.setState({ visible: false });
    };
    changeMonth = (jump: number) => () => {
        const { date } = this.props;
        date.setMonth(date.getMonth() + jump, 1);
        this.props.onDateChange(date);
    };
    onLabelClick = () => {
        this.setState((prevState: CalendarState) => ({
            ...prevState,
            visible: !prevState.visible
        }));
    };
    render() {
        const monthTable = helpers.getMonthTable(
            this.props.date.getMonth(),
            this.props.date.getFullYear()
        );
        const weekdays = helpers.getWeekDays("en");
        const curr = this.props.date;
        const elements = monthTable.map((vals: (Date)[], i1: number) => {
            const header =
                i1 == 0 ? (
                    <Styled.Row key={`h`}>
                        {[...Array(7)].map((_, i) => (
                            <Styled.HeaderCell key={`h-${i}`}>
                                {weekdays.get(i)}
                            </Styled.HeaderCell>
                        ))}
                    </Styled.Row>
                ) : null;
            const sub = vals.map((val: Date, i2: number) => {
                return (
                    <Styled.Cell
                        prev={helpers.compareDate(val, curr)}
                        current={helpers.compareMonthYear(val, curr)}
                        logged={this.inLogged(val)}
                        today={helpers.compareDate(val, new Date())}
                        key={val.toLocaleString("en-GB") + i2}
                        onClick={val ? this.onCellClick(val) : undefined}
                    >
                        {val
                            ? val.toLocaleString("en-GB", {
                                  day: "numeric"
                              })
                            : ""}
                    </Styled.Cell>
                );
            });
            return (
                <React.Fragment key={i1}>
                    {header}
                    <Styled.Row key={`${i1}`}>{sub}</Styled.Row>
                </React.Fragment>
            );
        });
        const { visible } = this.state;
        return (
            <Styled.Box>
                <Styled.Label>SELECT DATE</Styled.Label>
                <Styled.Controls>
                    {visible ? (
                        <Styled.Button onClick={this.changeMonth(-1)}>
                            <Styled.ArrowLeft />
                        </Styled.Button>
                    ) : null}
                    <Styled.Date onClick={this.onLabelClick}>
                        {curr.toLocaleString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}
                    </Styled.Date>
                    {visible ? (
                        <Styled.Button onClick={this.changeMonth(1)}>
                            <Styled.ArrowRight />
                        </Styled.Button>
                    ) : null}
                </Styled.Controls>
                {visible ? <Styled.Table>{elements}</Styled.Table> : null}
            </Styled.Box>
        );
    }
}

export default Calendar;
