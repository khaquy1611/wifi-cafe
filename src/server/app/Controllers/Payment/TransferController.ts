import { Request, Response, NextFunction } from 'express';
import isEmpty from 'lodash/isEmpty';
import speakeasy from 'speakeasy';
import { verify } from 'jsonwebtoken';
import { parseCookies } from 'nookies';
import {
    serviceBankAccountInfo,
    serviceAccountBalance,
    serviceTransferMake,
    serviceTransferTransaction,
} from '@sservice/TransferMoney';
import { saveLogAdmin } from '@sservice/index';
import { Admin, Payment, Store } from '@smodel/index';
import { ROLE_GROUP_ADMIN, ROLE_SUPER_ADMIN } from '@sconfig/app';
import catchAsync from '@sexceptions/CatchAsync';
import ErrorHandler from '@sexceptions/index';
import sendTelegram from '@svendor/Telegram';

const message = '[Yêu cầu rút tiền]';

export const transferMake = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {
        group_id,
        store_id,
        accountType,
        accountNo,
        bankCode,
        amount,
        token,
        remember,
        accountName,
        customerPhoneNumber,
    } = req.body;
    const group = await Store.findById(store_id);
    if (!group) {
        return next(
            new ErrorHandler({
                message: `${message} Không tìm thấy thông tin cửa hàng`,
                messageResponse: 'Không tìm thấy thông tin cửa hàng',
            }),
        );
    }
    const { tokenqr } = parseCookies({ req });
    const tokenAdmin = req.header('Authorization') || tokenqr;
    const jwtToken = verify(tokenAdmin, process.env.JWT_AUTHORIZATION as string) as { data: string };
    const admin = await Admin.findOne({ token: jwtToken.data, active: true });
    if (!admin) {
        return next(
            new ErrorHandler({
                message: `${message} Không tìm thấy thông tin admin`,
                messageResponse: 'Không tìm thấy thông tin admin',
            }),
        );
    }
    if (![ROLE_SUPER_ADMIN, ROLE_GROUP_ADMIN].includes(admin.role as string)) {
        return next(
            new ErrorHandler({
                message: `${message} Admin này không có quyền truy cập`,
                messageResponse: 'Admin này không có quyền truy cập',
            }),
        );
    }
    const secret = admin.secret_pin;
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
    });
    if (!verified) {
        return next(
            new ErrorHandler({
                message: `${message} Mã OTP không hợp lệ`,
                messageResponse: 'Mã OTP không hợp lệ',
            }),
        );
    }
    const { api_key, secret_key, partner_code } = group;
    const accountInfo = await serviceBankAccountInfo({
        accountType,
        accountNo,
        bankCode,
        api_key,
        secret_key,
        partner_code,
    });
    if (isEmpty(accountInfo) || accountInfo.accountName !== accountName) {
        return next(
            new ErrorHandler({
                message: `${message} Không tìm thấy thông tin người nhận`,
                messageResponse: 'Không tìm thấy thông tin người nhận',
            }),
        );
    }
    const accountBalance = await serviceAccountBalance({
        api_key,
        secret_key,
        partner_code,
    });
    if (!accountBalance.balance || accountBalance.balance < amount) {
        return next(
            new ErrorHandler({
                message: `${message} Số tiền cần chuyển lớn hơn số tiền hiện có`,
                messageResponse: 'Số tiền cần chuyển lớn hơn số tiền hiện có',
            }),
        );
    }
    const body = {
        ...req.body,
        api_key: group.api_key,
        secret_key: group.secret_key,
        partner_code: group.partner_code,
    };
    const data = await serviceTransferMake(body);
    if (remember) {
        await Payment.findOneAndUpdate(
            {
                group_id,
                store_id,
                key: 'transfer',
                accountNo,
                bankCode,
                accountType,
            },
            { group_id, store_id, accountType, accountNo, bankCode, accountName, customerPhoneNumber },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            },
        );
    }
    await saveLogAdmin({
        name: `thực hiện rút`,
        type: 'transfer_money',
        key: 'transfer',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id,
        store_id,
        order_id: `${data.transaction.amount.toLocaleString('en-AU')} đến ${accountInfo.accountName} (${
            accountInfo.bankCode
        } / ${accountInfo.accountNo})`,
    });
    sendTelegram({
        type: 'message',
        message: `YÊU CẦU RÚT TIỀN \n - Tên người nhận: <pre>${accountInfo.accountName}</pre> \n - Ngân hàng: <pre>${
            accountInfo.bankCode
        }</pre> \n - Số tài khoản / số thẻ: <pre>${
            accountInfo.accountNo
        }</pre> \n - Số tiền rút: <pre>${data.transaction.amount.toLocaleString(
            'en-AU',
        )}</pre> \n - Số tiền nhận được: <pre>${data.transaction.transferAmount.toLocaleString('en-AU')}</pre>`,
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const transferTransaction = catchAsync(async (req: Request, res: Response) => {
    const { store_id } = req.query;
    const { partnerRefId } = req.params;
    const group = await Store.findById(store_id);
    if (!group) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy thông tin cửa hàng',
        });
    }
    const data = await serviceTransferTransaction({
        partnerRefId,
        api_key: group.api_key,
        secret_key: group.secret_key,
        partner_code: group.partner_code,
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const accountBalance = catchAsync(async (req: Request, res: Response) => {
    const { store_id } = req.query;
    const group = await Store.findById(store_id);
    if (!group) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy thông tin chuỗi cửa hàng',
        });
    }
    const data = await serviceAccountBalance({
        api_key: group.api_key,
        secret_key: group.secret_key,
        partner_code: group.partner_code,
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const bankAccountInfo = catchAsync(async (req: Request, res: Response) => {
    const { store_id } = req.body;
    const group = await Store.findById(store_id);
    if (!group) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy thông tin chuỗi cửa hàng',
        });
    }
    const body = {
        ...req.body,
        api_key: group.api_key,
        secret_key: group.secret_key,
        partner_code: group.partner_code,
    };
    const data = await serviceBankAccountInfo(body);
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const bankAccountArchive = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id } = req.query;
    const data = await Payment.find(
        { group_id, store_id, key: 'transfer' },
        'group_id accountType accountNo bankCode accountName customerPhoneNumber',
    );
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});
