const ROLE_SUPER_ADMIN = 'SUPER_ADMIN';
const ROLE_GROUP_ADMIN = 'GROUP_ADMIN';
const ROLE_ADMIN = 'ADMIN';

const SALT_ROUNDS = 10;

const HIDE_SELECT_SECRET = '-api_key -secret_key';

const HIDE_SELECT_ADMIN = '-password -token -secret_pin -role_permissions -token_mini_app -device_token';

const PAYMENT_APPOTA = ['ATM', 'CC', 'EWALLET'];

export {
    ROLE_SUPER_ADMIN,
    ROLE_GROUP_ADMIN,
    ROLE_ADMIN,
    SALT_ROUNDS,
    HIDE_SELECT_SECRET,
    HIDE_SELECT_ADMIN,
    PAYMENT_APPOTA,
};
