export const getMonthTable = (month: number, year: number): (Date)[][] => {
    const current = new Date();
    const monthStart = new Date(
        year,
        month,
        1,
        current.getHours(),
        current.getMinutes(),
        current.getSeconds()
    );

    const days = [...new Array(6 * 7)].map(
        (_, index: number) =>
            new Date(
                monthStart.getTime() +
                    (index - monthStart.getDay()) * (24 * 60 * 60 * 1000)
            )
    );

    return listToMatrix([...days], 7);
};

export const getWeekDays = (locale: string): Map<number, string> => {
    var baseDate = new Date(Date.UTC(2017, 0, 1)); // just a Monday
    var weekDays = new Map<number, string>();
    for (var i = 0; i < 7; i++) {
        weekDays.set(
            i,
            baseDate.toLocaleDateString(locale, { weekday: "short" })
        );
        baseDate.setDate(baseDate.getDate() + 1);
    }
    return weekDays;
};

const listToMatrix = (list: any[], rowLength: number) => {
    var matrix: any[][] = [];
    for (var i = 0, k = -1; i < list.length; i++) {
        if (i % rowLength === 0) {
            k++;
            matrix[k] = [];
        }
        matrix[k].push(list[i]);
    }
    return matrix;
};

export const compareDate = (d1: Date, d2: Date): boolean => {
    if (d1.getDate() != d2.getDate()) {
        return false;
    }
    if (d1.getMonth() != d2.getMonth()) {
        return false;
    }
    if (d1.getFullYear() != d2.getFullYear()) {
        return false;
    }
    return true;
};

export const compareMonthYear = (d1: Date, d2: Date): boolean => {
    if (d1.getMonth() != d2.getMonth()) {
        return false;
    }
    if (d1.getFullYear() != d2.getFullYear()) {
        return false;
    }
    return true;
};
