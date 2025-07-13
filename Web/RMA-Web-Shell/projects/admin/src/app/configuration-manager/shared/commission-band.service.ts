import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { CommissionBand } from './commission-band';

@Injectable()
export class CommissionBandService {

  private apiUrl = 'mdm/api/CommissionBand';

  dialogData: any;

  constructor(
    private readonly commonService: CommonService) {
  }

  getDialogData() {
    return this.dialogData;
  }

  addBand (commissionBand: CommissionBand): void {
    this.dialogData = commissionBand;
  }

  getCommissionBand(id: any): Observable<CommissionBand> {
    return this.commonService.get<CommissionBand>(id, this.apiUrl);
  }

  getCommissionBands(): Observable<CommissionBand[]> {
    return this.commonService.getAll<CommissionBand[]>(this.apiUrl);
  }

  addCommissionBand(commissionBand: CommissionBand): Observable<number> {
    this.dialogData = commissionBand;
    return this.commonService.postGeneric<CommissionBand, number>(this.apiUrl, commissionBand);
  }

  editCommissionBand(commissionBand: CommissionBand): Observable<boolean> {
    this.dialogData = commissionBand;
    return this.commonService.edit<CommissionBand>(commissionBand, this.apiUrl);
  }

  deleteCommissionBand(commissionBand: CommissionBand): Observable<boolean> {
    this.dialogData = commissionBand;
    return this.commonService.remove(commissionBand.commissionBandId, this.apiUrl);
  }
}
