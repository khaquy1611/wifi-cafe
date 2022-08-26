/* eslint-disable @typescript-eslint/ban-ts-comment */
import nodemailer from 'nodemailer';
// @ts-ignore
import inlineBase64 from 'nodemailer-plugin-inline-base64';

import sendTelegram from '@svendor/Telegram';

interface PropsType {
    email: string;
    subject?: string;
    text?: string;
    html: string;
}

const sendMail = ({
    email,
    html,
    subject = 'Đăng ký tài khoản Wifi Cà Phê',
    text = 'Đăng ký tài khoản Wifi Cà Phê',
}: PropsType) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER, // generated ethereal user
            pass: process.env.MAIL_PASS, // generated ethereal password
        },
    });
    transporter.use('compile', inlineBase64({ cidPrefix: 'somePrefix_' }));
    // send mail with defined transport object
    transporter.sendMail(
        {
            from: '<no-reply@wificaphe.com>', // sender address
            to: email, // list of receivers
            subject, // Subject line
            text,
            html, // html body
        },
        // eslint-disable-next-line func-names
        function (error) {
            if (error) {
                sendTelegram({
                    message: `💥 Lỗi gửi email đến ${email}
<i>❌ ${error.message}</i>`,
                });
            }
        },
    );
};

export default sendMail;
