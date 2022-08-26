import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    region: 'us-east-11',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: 'https://s3.kstorage.vn',
});

export default s3;
