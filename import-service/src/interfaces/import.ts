export interface ImportFileBucketParams {
  region?: string;
  bucket: string;
  key: string;
  destinationKey?: string;
  contentType?: string;
}
