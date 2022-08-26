import moment from 'moment';
import { customAlphabet } from 'nanoid';

export const randomString = (length = 36, upperCase = false) => {
    const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length);
    const id = nanoid();
    if (upperCase) {
        return id.toLocaleUpperCase();
    }
    return id;
};

export const getCookie = (cname: string, cookie: string) => {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(cookie);
    const ca = decodedCookie.split(';');
    const ca_length = ca.length;
    for (let i = 0; i < ca_length; i += 1) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
};

export const alphabeticalSortedQuery = (data: { [key: string]: unknown }) => {
    const alphabeticalSortedData: { [key: string]: string } = Object.keys(data)
        .sort()
        .reduce(
            (acc, key) => ({
                ...acc,
                [key]: typeof data[key] !== 'string' ? JSON.stringify(data[key]) : data[key],
            }),
            {},
        );

    const query = Object.keys(alphabeticalSortedData)
        .map((key) => {
            return `${key}=${alphabeticalSortedData[key]}`;
        })
        .join('&');

    return query;
};

export const getDatesBetweenDates = (startDate: number, endDate: number) => {
    let dates: Array<number> = [];
    let theDate = startDate;
    // if (moment.unix(endDate).diff(moment.unix(startDate), 'days') < 93) {
    while (theDate < endDate) {
        dates = [...dates, theDate];
        theDate = moment.unix(theDate).add('days', 1).unix();
    }
    dates = [...dates, endDate];
    // }
    return dates;
};

export const valuesToFilter = (values: any, callback = (value: string) => value) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter = {} as any;
    Object.keys(values).forEach((key) => {
        if (values[key]) {
            filter[callback(key)] = values[key];
        }
    });
    return filter;
};

export const fonts = {
    Roboto: {
        normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
        bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
        italics: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
        bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf',
    },
};

export const checkDailyLogStatus = (status: string): boolean => {
    const arrStatus: string[] = ['import', 'export', 'sell'];
    if (arrStatus.includes(status)) {
        return true;
    }
    return false;
};
