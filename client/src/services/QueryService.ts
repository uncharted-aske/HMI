import s3Client from '@/services/S3Service';

// Attempt #1: AWS SDK V1
export const loadData = async (): Promise<void> => {
  const params = { Bucket: 'aske' };

  s3Client.listObjects(params, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
};

// Attempt #2: AWS SDK Modularized V3
// import { ListBucketsCommand, ListBucketsCommandInput } from '@aws-sdk/client-s3';

// export const loadData = async (): Promise<void> => {
//   const params: ListBucketsCommandInput = {
//     // Bucket: 'aske',
//   };
//   const command = new ListBucketsCommand(params);

//   try {
//     const data = await s3Client.send(command);
//     console.log(data);
//     // process data.
//   } catch (err) {
//     console.log('Got error:', err);
//   } finally {
//     // finally.
//     console.log('IT HAPPENED');
//   }
// };

// Attempt #3: MINIO SDK
// export const loadData = async (): Promise<void> => {
//   console.log(s3Client);
//   // minioClient.listBuckets(function (err, buckets) {
//   //   if (err) return console.log(err);
//   //   console.log('buckets :', buckets);
//   // });
// };
