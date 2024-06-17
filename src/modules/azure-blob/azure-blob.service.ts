import { DefaultAzureCredential } from '@azure/identity';
import {
  BlobClient,
  BlobServiceClient,
  ContainerSASPermissions,
  PublicAccessType,
  SASProtocol,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { IAzureBlobUploadFileResponse } from './interfaces/azure-blob-upload-files.interface';

@Injectable()
export class AzureBlobService {
  private accountName: string;
  private blobServiceClient: BlobServiceClient;

  constructor(private configService: ConfigService) {
    this.accountName = this.configService.get('AZURE_STORAGE_ACCOUNT_NAME');
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );
  }

  async uploadFiles(
    files: Express.Multer.File[],
    containerName: string,
    publicAccessType: PublicAccessType,
  ): Promise<IAzureBlobUploadFileResponse[]> {
    if (files.length === 0) return [];
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);

    // create container if not exist yet
    if (!(await containerClient.exists()))
      await containerClient.create({ access: publicAccessType });

    // modify current access type if necessary
    const existingPublicAccessType = (await containerClient.getAccessPolicy())
      .blobPublicAccess;
    if (existingPublicAccessType !== publicAccessType)
      await containerClient.setAccessPolicy(publicAccessType);

    // uplaod files
    const fileUrls: IAzureBlobUploadFileResponse[] = [];
    for (const file of files) {
      console.log('file', typeof file);
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
      // TODO: delete if exists
      try {
        await containerClient.deleteBlob(name);
      } catch (e) {
        continue;
      }
    }
  }

  async createContainerSas(containerName: string) {
    const startsOn = moment().subtract(1, 'hours').toDate();
    const expiresOn = moment().add(1, 'days').toDate();
    const userDelegationKey = await this.blobServiceClient.getUserDelegationKey(
      startsOn,
      expiresOn,
    );
    // https://learn.microsoft.com/en-us/rest/api/storageservices/create-user-delegation-sas
    const permissions = 'rcd';
    const sasOptions = {
      containerName,
      permissions: ContainerSASPermissions.parse(permissions),
      protocol: SASProtocol.HttpsAndHttp,
      startsOn,
      expiresOn,
    };
    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      userDelegationKey,
      this.accountName,
    ).toString();
    return sasToken;
  }
}
