import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { BehaviorSubject } from 'rxjs';
import * as XLSX from 'xlsx';
import { BillingService } from '../../../../services/billing.service';
import { DebtorStatusEnum } from 'projects/fincare/src/app/shared/enum/debtor-status.enum';
import { FinPayee } from 'projects/fincare/src/app/shared/models/finpayee';
import { BulkWriteOffModel } from '../../../../models/bulk-write-off';
@Component({
  selector: 'app-upload-new-list',
  templateUrl: './upload-new-list.component.html',
  styleUrls: ['./upload-new-list.component.css']
})
export class UploadNewListComponent {

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('processing...please wait');

  // inputs for the xml parser component
  title = 'Upload Bulk Write Offs';
  expectedColumnHeadings = ['Financial Year','Underwriting year','MemberNumber',	'MemberName',	'Current Age Balance',	'Interest reversal reference',	
    'Interest reversal amount',	'Premium write off reference',	
    'Premium write off amount',	'Status',	'Debtors Clerk',	'Reason' ];
  invalidRowsForExport: any[][] = [];

  writeOffs: BulkWriteOffModel[];

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
    this.writeOffs = [];

    fileData.forEach(row => {
      const writeOff = new BulkWriteOffModel();

      writeOff.financialYear= row[0] as number;
      writeOff.underwritingYear = row[1] as number;
      writeOff.memberNumber = row[2] as string;
      writeOff.memberName = row[3] as string;
      writeOff.ageBalance = row[4] as number;
      writeOff.interestReversalReference = row[5] as string;
      writeOff.interestReversalAmount = row[6] as number;
      writeOff.premiumWriteOffReference = row[7] as string;
      writeOff.premiumWriteOffAmount = row[8] as number ;
      writeOff.status = row[9] as number;
      writeOff.debtorsClerk = row[10] as string;
      writeOff.reason = row[11] as string;      

      try {
        let status = row[9] as string;
        status = this.capitalizeWords(status);
        writeOff.status = DebtorStatusEnum[this.format(status).replace(/\s/g, "")];
      } catch {
        writeOff.status = null;
      };

      if (this.isValid(writeOff, row)) {
        this.writeOffs.push(writeOff);
      } else {
        this.invalidRowsForExport.push(row);
      }
    });
  }

  isValid(writeOff: BulkWriteOffModel, row: any[]): boolean {
    let isValid = true;
    let failedValidationReasons = '';

    // Validate Details
    if (!writeOff.status) {
      failedValidationReasons += 'Debtor status is invalid, ';
      isValid = false;
    }
    if (!writeOff.memberNumber) {
      failedValidationReasons += 'Member Number is invalid, ';
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
      this.billingService.uploadWriteOffList(this.writeOffs, '').subscribe(result => {
        if (result) {
          this.alertService.successToastr(`Write-offs successfully uploaded for processing`);
        }
         else {
          this.alertService.errorToastr('No write offs were processed');
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
}
