import crypto from 'crypto';

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text: string) {
    const encryptKey = process.env.ENCRYPTION_KEY as string;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptKey), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(text: string) {
    const encryptKey = process.env.ENCRYPTION_KEY as string;
    const textParts = text.split(':');
    const buffer_value = textParts.shift() as string;
    const iv = Buffer.from(buffer_value, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptKey), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

export { encrypt, decrypt };
