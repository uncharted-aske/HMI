// FIXME: Use aws sdk v3 instead of v2 once following bug is fixed as v3 is
//        modularized: https://github.com/aws/aws-sdk-js-v3/issues/2121
import AWS from 'aws-sdk';

export default new AWS.S3({
  accessKeyId: 'foobar',
  secretAccessKey: 'foobarbaz',
  endpoint: 'http://10.64.18.171:9000',
  s3ForcePathStyle: true, // required with minio
  signatureVersion: 'v4',
});
