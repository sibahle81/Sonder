import { Component } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { FinPayee } from '../../../shared/models/finpayee';
import { DebtorStatusEnum } from '../../../shared/enum/debtor-status.enum';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { Period } from 'projects/admin/src/app/configuration-manager/shared/period';
import { CollectionsService } from '../../services/collections.service';
import { LegalHandOverDetail } from '../../models/legal-hand-over-detail';
import { BillingService } from '../../services/billing.service';

@Component({
  templateUrl: './bulk-debtor-handover-upload.component.html',
  styleUrls: ['./bulk-debtor-handover-upload.component.css']
})
export class BulkDebtorHandoverUploadComponent {

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('processing...please wait');
  public isLoadingPeriod$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // inputs for the xml parser component
  title = 'Upload Bulk Debtor Handover';
  expectedColumnHeadings = ['CustomerNo', 'CustomerName', 'Class', 'Agent', ' OpeningBalance ', ' CurrentBalance ', 'CurrentStatus',
    'AccountAge', '1FollowUpDate', '2FollowUpDate', 'AgentStatus', 'Comment', 'LastChangedDate', 'Contact number', 'Email address'];
  invalidRowsForExport: any[][] = [];

  handOverDetails: LegalHandOverDetail[];
  selectedPeriodId: number;
  fileName: string;

  constructor(
    private readonly billingService: BillingService,
    private readonly alertService: ToastrManager) { }

  receiveFileData($event: any[][]) {
    if ($event && $event.length > 0) {
      this.parseFileData($event);
    }
  }

  parseFileData(fileData: any[][]) {
    this.invalidRowsForExport = [];
    this.handOverDetails = [];

    fileData.forEach(row => {
      const handOverDetail = new LegalHandOverDetail();
      handOverDetail.periodId = this.selectedPeriodId;

      handOverDetail.debtorNumber = row[0] as string;
      handOverDetail.customerName = row[1] as string;
      handOverDetail.industryClass = row[2] as string;   
      handOverDetail.openingBalance = row[4] as string;
      handOverDetail.currentBalance = row[5] as string;   
      handOverDetail.agentStatus = row[10] as string;    

      try {
        let status = row[10] as string;
        status = this.capitalizeWords(status);
        handOverDetail.debtorStatus = DebtorStatusEnum[this.format(status).replace(/\s/g, "")];
      } catch {
        handOverDetail.debtorStatus = null;
      };

      if (this.isValid(handOverDetail, row)) {
        this.handOverDetails.push(handOverDetail);
      } else {
        this.invalidRowsForExport.push(row);
      }
    });
  }

  isValid(handOverDetail: LegalHandOverDetail, row: any[]): boolean {
    let isValid = true;
    let failedValidationReasons = '';

    // Validate Details
    if (!handOverDetail.debtorStatus) {
      failedValidationReasons += 'Debtor status is invalid, ';
      isValid = false;
    }

    if (isValid) {
      this.addReasonColumn('N/A', row);
    } else {
      this.addReasonColumn(failedValidationReasons, row);
    }

    return isValid;
  }

  addReasonColumn(reasons: any, row: any[]) {
    row.push(reasons);
  }

  submit($event: boolean) {
    if ($event) {
      this.isLoading$.next(true);
      this.billingService.bulkDebtorHandover(this.handOverDetails, this.fileName).subscribe(result => {
        if (result && result == this.handOverDetails.length) {
          this.alertService.successToastr(`${result} debtors statuses were updated successfully`);
        } else if (result && result > 0 && result < this.handOverDetails.length) {
          this.alertService.warningToastr(`${result} of ${this.handOverDetails.length} debtors statuses were updated successfully`);
        } else {
          this.alertService.errorToastr('no debtor statuses were updated');
        }
        this.isLoading$.next(false);
      });
    }
  }

  format(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  capitalizeWords(input: string): string {
    return input
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  periodFilterChanged(item : [{ key:string, value: number }]) {
    if(item[0] && item[0].value){
      this.selectedPeriodId = item[0].value;
    }
  }
}
