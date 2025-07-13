
import { SftpRequestStatusTypeEnum } from "projects/shared-models-lib/src/lib/enums/sftp-request-status-type-enum";
import { SftpRequestTypeEnum } from "projects/shared-models-lib/src/lib/enums/sftp-request-type-enum";

export class SftpRequest {
    sftpRequestId: number;
    sftpRequestType: SftpRequestTypeEnum;
    fileName: string;
    sftpRequestStatus: SftpRequestStatusTypeEnum;
    itemsInRequest?: number;
    noResponses: number;
    requestedDate: Date;
    isDeleted: boolean;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
}
