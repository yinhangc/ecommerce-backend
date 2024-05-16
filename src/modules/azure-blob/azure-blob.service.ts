import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, PublicAccessType } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import toTime from 'to-time';

@Injectable()
export class AzureBlobService {
  private accountName: string;
  private blobServiceClient: BlobServiceClient;

  constructor(private configService: ConfigService) {
    const accountName = this.configService.get('AZURE_STORAGE_ACCOUNT_NAME');
    this.blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );
  }

  async uploadFiles(
    files: Express.Multer.File[],
    publicAccessType: PublicAccessType,
  ): Promise<string[]> {
    const containerClient = this.blobServiceClient.getContainerClient('all');
    if (!(await containerClient.exists()))
      await containerClient.create({ access: publicAccessType });
    else await containerClient.setAccessPolicy(publicAccessType);
    const fileUrls = [];
    for (const file of files) {
      const extension = file.mimetype.split('/').pop();
      const blobName = uuidv4() + `.${extension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      console.log(
        `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`,
      );
      await blockBlobClient.uploadData(file.buffer, {
        metadata: {
          name: file.originalname,
        },
      });
      fileUrls.push(blockBlobClient.url);
    }
    return fileUrls;
  }

  async createContainerSas(containerName: string) {
    const now = new Date();
    // const refreshTokenExpiry =
  }
}
