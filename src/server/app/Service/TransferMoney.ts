import { sign } from 'jsonwebtoken';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';
import crypto from 'crypto';
import {
    TransferBankAccountInfoResponse,
    TransferBankAccountInfoRequest,
    TransferAccountBalanceRequest,
    TransferMakeRequest,
    TransferMakeResponse,
    TransferTransactionRequest,
    TransferTransactionResponse,
} from '@stypes/index';
import { alphabeticalSortedQuery, randomString } from '@shelpers/index';
import BankMerchant from '@svendor/BankMerchant';
import ErrorHandler from '@sexceptions/index';

const message = '[Yêu cầu rút tiền]';

export const createToken = async ({ secret_key, partner_code, api_key }: TransferAccountBalanceRequest) => {
    try {
        const token = sign(
            {
                iss: partner_code,
                jti: `${api_key}-${new Date().getTime()}`,
                api_key,
            },
            secret_key,
            { expiresIn: '1h' },
        );
        return token;
    } catch (e) {
        throw new ErrorHandler({ message: `${e.message}`, messageResponse: e.message });
    }
};

export const createSignatute = (data: any, secret_key: string) => {
    try {
        const pickData = pickBy(data, _.identity);
        const valueData = alphabeticalSortedQuery(pickData);
        const signature = crypto.createHmac('sha256', secret_key).update(valueData).digest('hex');
        return signature;
    } catch (e) {
        throw new ErrorHandler({ message: `${message} ${e.message}`, messageResponse: e.message });
    }
};

export const serviceAccountBalance = async (data: TransferAccountBalanceRequest) => {
    try {
        const token = await createToken(data);
        const account_balance = (await BankMerchant({
            url: `${process.env.API_EBILL_APPOTAPAY}/api/v1/service/accounts/balance`,
            method: 'GET',
            token,
        })) as { account: { balance: number } };
        return account_balance.account;
    } catch (e) {
        throw new ErrorHandler({ message: `${message} ${e.message}`, messageResponse: e.message });
    }
};

export const serviceTransferMake = async (data: TransferMakeRequest) => {
    try {
        const {
            api_key,
            secret_key,
            partner_code,
            accountName,
            bankCode,
            accountNo,
            accountType,
            amount,
            message,
            customerPhoneNumber,
            contractNumber,
        } = data;
        const body = {
            bankCode,
            accountNo,
            accountType,
            accountName,
            amount,
            feeType: 'receiver',
            partnerRefId: randomString(24, true),
            ...(!isEmpty(message) ? { message } : {}),
            ...(!isEmpty(customerPhoneNumber) ? { customerPhoneNumber } : {}),
            ...(!isEmpty(contractNumber) ? { contractNumber } : {}),
        };
        const signature = createSignatute(body, secret_key);
        const token = await createToken({ secret_key, partner_code, api_key });
        const transfer_make = (await BankMerchant({
            url: `${process.env.API_EBILL_APPOTAPAY}/api/v1/service/transfer/make`,
            method: 'POST',
            data: { ...body, signature },
            token,
        })) as TransferMakeResponse;
        return { transaction: transfer_make.transaction, account: transfer_make.account };
    } catch (e) {
        throw new ErrorHandler({ message: `${message} ${e.message}`, messageResponse: e.message });
    }
};

export const serviceTransferTransaction = async ({
    partnerRefId,
    secret_key,
    partner_code,
    api_key,
}: TransferTransactionRequest) => {
    try {
        const token = await createToken({ secret_key, partner_code, api_key });
        const transfer_transaction = (await BankMerchant({
            url: `${process.env.API_EBILL_APPOTAPAY}/api/v1/service/transfer/transaction/${partnerRefId}`,
            method: 'GET',
            token,
        })) as TransferTransactionResponse;
        return transfer_transaction.transaction;
    } catch (e) {
        throw new ErrorHandler({ message: `${message} ${e.message}`, messageResponse: e.message });
    }
};

export const serviceBankAccountInfo = async ({
    accountType,
    accountNo,
    bankCode,
    secret_key,
    partner_code,
    api_key,
}: TransferBankAccountInfoRequest) => {
    try {
        const data = {
            bankCode,
            accountNo,
            accountType,
            partnerRefId: randomString(24, true),
        };
        const token = await createToken({ secret_key, partner_code, api_key });
        const signature = createSignatute(data, secret_key);
        const account_info = (await BankMerchant({
            url: `${process.env.API_EBILL_APPOTAPAY}/api/v1/service/transfer/bank/account/info`,
            method: 'POST',
            data: { ...data, signature },
            token,
        })) as TransferBankAccountInfoResponse;
        return account_info.accountInfo;
    } catch (e) {
        throw new ErrorHandler({ message: `${message} ${e.message}`, messageResponse: e.message });
    }
};
