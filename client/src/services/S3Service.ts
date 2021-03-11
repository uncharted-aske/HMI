// Attempt #1: AWS SDK V2
import AWS from 'aws-sdk';

export default new AWS.S3({
  accessKeyId: 'foobar',
  secretAccessKey: 'foobarbaz',
  endpoint: 'http://10.64.18.171:9000',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

// Attempt #2: Modularized AWS SDK V3
// import { S3Client } from '@aws-sdk/client-s3';

// export default new S3Client({
//   region: 'us-east-1',
//   credentials: {
//     accessKeyId: 'foobar',
//     secretAccessKey: 'foobarbaz',
//   },
//   tls: false,
//   endpoint: {
//     port: 9000,
//     protocol: 'http',
//     hostname: '10.64.18.171',
//     path: 'minio',
//   },
//   // endpoint: 'http://10.64.18.171:9000',
//   forcePathStyle: true,
//   apiVersion: '2020-08-04',
// });

// Attempt #3: Minio SDK
// import Minio from 'minio';

// export default new Minio.Client({
//   endPoint: '10.64.18.171',
//   port: 9000,
//   useSSL: false,
//   accessKey: 'foobar',
//   secretKey: 'foobarbaz',
// });
