interface Date {
    getCorrectUCTDate(): Date;
}

interface DateConstructor {
    dateFormat(date: Date): string;
    formatDate(date: Date): string;
    getActualDate(date: Date): Date;
}

// Use this when saving back the date, when the data is ready to be sent back to the server.
Date.prototype.getCorrectUCTDate = function (): Date {
    const formattedDate = Date.formatDate(this);
    return new Date(formattedDate);
};

// Use this when displaying date on the front end
Date.getActualDate = function isoDate(date: Date): Date {
    if (isDateString(date)) {
        const actualDate = date.toString().split('T')[0];
        return new Date(actualDate);
    }

    return date;
};

Date.dateFormat = function dateFormat(date: Date): string {
    return date.getFullYear() + '-' +
        getValue(date.getMonth() + 1) + '-' +
        getValue(date.getDate());
};

Date.formatDate = function formatDate(date: Date): string {
    if (isDateString(date)) {
        return date.toString();
    }

    return date.getFullYear() + '-' +
        getValue(date.getMonth() + 1) + '-' +
        getValue(date.getDate()) + 'T' +
        getValue(date.getHours()) + ':' +
        getValue(date.getMinutes()) + ':' +
        getValue(date.getSeconds()) + '.000Z';
};

function isDateString(date: Date): boolean {
    if (!date) { return false; }
    const _regExp = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$');
    return _regExp.test(date.toString());
}

function getValue(value: number): string {
    if (value < 10) {
        return `0${value}`;
    }

    return value.toString();
}
