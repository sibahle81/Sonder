import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { BenefitDetail } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { ChildToAdultPensionLedger } from '../../shared-penscare/models/child-to-adult-pension-ledger.model';
import { CertificateOfLifeDetail } from '../../shared-penscare/models/certificate-of-life-detail';
import { CorrectiveEntry } from 'projects/shared-components-lib/src/lib/models/corrective-entry.model';
import { SftpRequest } from '../../shared-penscare/models/sftp-request';
import {TebaFileData} from '../../shared-penscare/models/teba-file-data';

@Injectable({
  providedIn: 'root'
})
export class ProofOfLifeService {
  private apiUrl = 'pen/api/ProofOfLife';

  constructor(private readonly commonService: CommonService) {}

  public getTebaSftpRequests(): Observable<SftpRequest[]> {
    return this.commonService.get<SftpRequest[]>(``, `${this.apiUrl}/GetTebaSftpRequests`);
  }
  public getTebaSftpRequestByDateRange(fromDate: string, toDate: string): Observable<SftpRequest[]> {
    return this.commonService.get<SftpRequest[]>(``, `${this.apiUrl}/GetTebaSftpRequestByDateRange/${fromDate}/${toDate}`);
  }

  public getProofOfLifeDataSendForValidationBySourceRequestId(sourceRequestId: number): Observable<TebaFileData[]> {
    return this.commonService.getAll<TebaFileData[]>(`${this.apiUrl}/GetProofOfLifeDataSendForValidationBySourceRequestId/${sourceRequestId}`);
  }

  public getProofOfLifeDataForValidation(): Observable<TebaFileData[]> {
    return this.commonService.getAll<TebaFileData[]>(`${this.apiUrl}/GetProofOfLifeDataForValidation`);
  }
  public requestProofOfLifeVerification(tebaFileData: TebaFileData[]): Observable<SftpRequest> {
    return this.commonService.postGeneric<TebaFileData[], SftpRequest>(`${this.apiUrl}/RequestProofOfLifeVerification`, tebaFileData);
  }
}
