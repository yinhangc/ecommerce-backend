import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, PublicAccessType } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { IAzureBlobUploadFileResponse } from './interfaces/azure-blob-upload-files.interface';

@Injectable()
export class AzureBlobService {
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
    containerName: string,
    publicAccessType: PublicAccessType,
  ): Promise<IAzureBlobUploadFileResponse[]> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    if (!(await containerClient.exists()))
      await containerClient.create({ access: publicAccessType });
    else await containerClient.setAccessPolicy(publicAccessType);
    const fileUrls: IAzureBlobUploadFileResponse[] = [];
    for (const file of files) {
      console.log('file', file);
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
      fileUrls.push({
        url: blockBlobClient.url,
        blobName,
        originalName: file.originalname,
      });
    }
    console.log('fileUrls', fileUrls);
    return fileUrls;
  }

  async deleteFiles(containerName: string, blobNames: string[]): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    if (!(await containerClient.exists())) return;
    for (const name of blobNames) {
      await containerClient.deleteBlob(name);
    }
  }

  async createContainerSas(containerName: string) {
    const now = new Date();
    // const refreshTokenExpiry =
  }
}
