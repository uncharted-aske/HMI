// FIXME: Use aws sdk v3 instead of v2 once following bug is fixed as v3 is
//        modularized: https://github.com/aws/aws-sdk-js-v3/issues/2121
import AWS from 'aws-sdk';

export default new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: true, // required with minio
  signatureVersion: 'v4',
});
