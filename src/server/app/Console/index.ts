import cron from 'node-cron';

import ResetNotify from './Commands/ResetNotify';
import ResetCookieOrder from './Commands/ResetCookieOrder';
import StatOrderOverview from './Commands/StatOrderOverview';
import StatOrderPayment from './Commands/StatOrderPayment';
import StatOrderProduct from './Commands/StatOrderProduct';
import StatOrderType from './Commands/StatOrderType';
import StatOrderCustomer from './Commands/StatOrderCustomer';
import StatOrderUser from './Commands/StatOrderUser';

const cronTab = () => {
    cron.schedule('30 * * * *', () => {
        ResetCookieOrder();
    });

    cron.schedule('00 00 * * *', () => {
        ResetNotify();
    });

    cron.schedule('00 02 * * *', () => {
        StatOrderOverview();
    });

    cron.schedule('30 02 * * *', () => {
        StatOrderPayment();
    });

    cron.schedule('00 03 * * *', () => {
        StatOrderCustomer();
    });

    cron.schedule('15 03 * * *', () => {
        StatOrderUser();
    });

    cron.schedule('30 03 * * *', () => {
        StatOrderProduct();
    });

    cron.schedule('00 04 * * *', () => {
        StatOrderType();
    });

    return cron;
};

export default cronTab;
