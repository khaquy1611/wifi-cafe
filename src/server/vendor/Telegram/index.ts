import { TelegramClient } from 'messaging-api-telegram';
import logger from '../Logger';

interface PropsType {
    type?: 'message' | 'photo';
    message: string;
    captionPhoto?: string;
    key?: 'log' | 'sale';
}

export enum ParseMode {
    Markdown = 'Markdown',
    HTML = 'HTML',
}

const sendTelegram = ({ type = 'message', message, captionPhoto = '', key = 'log' }: PropsType) => {
    const accessToken =
        key === 'log'
            ? (process.env.TELEGRAM_ACCESS_TOKEN as string)
            : (process.env.TELEGRAM_ACCESS_TOKEN_SALE as string);
    const bot = new TelegramClient({
        accessToken,
    });
    const chatId =
        key === 'log' ? (process.env.TELEGRAM_CHAT_ID as string) : (process.env.TELEGRAM_CHAT_ID_SALE as string);
    bot.getWebhookInfo().catch((error) => {
        logger.error(`send_telegram - Stack: ${error}`);
    });
    if (type === 'message') {
        const messageTele = `[${process.env.APP_DEBUG?.toLocaleUpperCase()} - wificaphe.com]\n =============== \n${message}`;
        bot.sendMessage(chatId, messageTele, {
            parseMode: ParseMode.HTML,
        });
        return;
    }
    const caption = `[${process.env.APP_DEBUG?.toLocaleUpperCase()} - wificaphe.com]\n =============== \n${captionPhoto}`;
    bot.sendPhoto(chatId, message, {
        caption,
    });
};

export default sendTelegram;
