import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BillingService } from '../../services/billing.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DatePipe } from '@angular/common';
import { BulkManualAllocation } from '../../models/imports/bulk-manual-allocation';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { PeriodService } from 'projects/admin/src/app/configuration-manager/shared/period.service';
import { Period } from 'projects/admin/src/app/configuration-manager/shared/period';

@Component({
  selector: 'app-billing-uploads',
  templateUrl: './billing-uploads.component.html',
  styleUrls: ['./billing-uploads.component.css']
})
export class BillingUploadsComponent {
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('processing...please wait');
  
  public isLoadingPeriod$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  title = 'Upload Allocation';
  periodTitle = 'Period To Post To';
  expectedColumnHeadings = ['BankAccountNumber', 'Amount',	'StatementReference',	'TransactionDate',	'UserReference',	'UserReference2',	'Debtor no/Policy no/Listing/Com'];

  invalidRowsForExport: any[][] = [];
  BulkManualAllocation: BulkManualAllocation;
  bulkmanualAllocations: BulkManualAllocation[];

  processedErrorDataAllocations: BulkManualAllocation[];
  showPeriodControl = true;
  selectedPeriodStatus: PeriodStatusEnum;
  periodIsValid = false;
  selectedPeriod : Period;

  constructor(private readonly billingService:BillingService, 
    private readonly datePipe: DatePipe, 
    private readonly periodService: PeriodService,
    private readonly alertService: ToastrManager) { }

  receiveFileData($event: any[][]) {
    if ($event && $event.length > 0) {
      this.parseFileData($event);
    }
  }

  parseFileData(fileData: any[][]) {
    this.invalidRowsForExport = [];
    this.bulkmanualAllocations = [];
    fileData.forEach(row => {
      const bulkManualAllocation = new BulkManualAllocation();
      bulkManualAllocation.bankAccountNumber = row[0];
      bulkManualAllocation.amount = row[1];
      bulkManualAllocation.statementReference = row[2];
      bulkManualAllocation.transactionDate = this.datePipe.transform(new Date(row[3] ?? row[3] as number).getCorrectUCTDate().toDateString(), 'yyyy-MM-dd');
      bulkManualAllocation.userReference = row[4];
      bulkManualAllocation.userReference2 = row[5];
      bulkManualAllocation.allocateTo = row[6];
      bulkManualAllocation.isDeleted = false;
      bulkManualAllocation.allocatable = "YES";

      if (this.isValid(bulkManualAllocation, row)) {
        this.bulkmanualAllocations.push(bulkManualAllocation);
      } else {
        this.invalidRowsForExport.push(row);
      }
    });
  }

  isValid(bulkManualAllocation: BulkManualAllocation, row: any[]): boolean {
    let isValid = true;
    let failedValidationReasons = '';

    //Remove validations for now it is garbage in garbage out

    if (isValid) {
      this.addReasonColumn('Valid', row);
    } else {
      this.addReasonColumn(failedValidationReasons, row);
    }

    return isValid;
  }

  isValidProcessed(bulkManualAllocation: BulkManualAllocation): boolean {
    let isValid = true;
    let failedValidationReasons = '';

    if (bulkManualAllocation && bulkManualAllocation.error) {
      failedValidationReasons = bulkManualAllocation.error;
      isValid = false;
    }

    if (isValid) {
      this.addReasonColumn('Valid', this.bulkmanualAllocations);
    } else {
      this.addReasonColumn(failedValidationReasons, this.bulkmanualAllocations);
    }

    return true;
  }

  addReasonColumn(reasons: any, row: any[]) {
    row.push(reasons);
  }

  submit($event: boolean) {

    if(!this.selectedPeriod || !this.periodIsValid)
      {
        this.alertService.errorToastr('Period was not selected');
        return;
      }

    this.isLoading$.next(true);

    this.bulkmanualAllocations.forEach(manualAllocation => {
      manualAllocation.periodId = this.selectedPeriod.id;
    });

    this.billingService.processBillingAllocation(this.bulkmanualAllocations).subscribe(() => {
      this.alertService.successToastr('Bulk data has been uploaded and being processed.')
      this.billingService.getProcessedErrorBillingAllocations(112).subscribe(processedErrorData => { //REMEMBER YOU HARDCODING THIS
        if (processedErrorData) {
          this.processedErrorDataAllocations = processedErrorData;
        }
      });
      this.isLoading$.next(false);
    });
  }

  concurrentPeriodSelected($event) {
    this.selectedPeriodStatus = $event;
    this.selectedPeriod = undefined;

    if(this.selectedPeriodStatus)
      {
        switch( this.selectedPeriodStatus )
        {
          case PeriodStatusEnum.Latest:
            {
              this.isLoadingPeriod$.next(true);
              this.periodService.getLatestPeriod().subscribe(
                result=>
                  {
                    this.selectedPeriod = result;
                    this.isLoadingPeriod$.next(false);
                  }
              );
              break;
            }

            case PeriodStatusEnum.Current:
            {
                this.isLoadingPeriod$.next(true);
                this.periodService.getCurrentPeriod().subscribe(
                  result=>
                    {
                      this.selectedPeriod = result;
                      this.isLoadingPeriod$.next(false);
                    }
                );
                break;
            }
        }
      }
  }

  isValidPeriodSelected($event) {
    this.periodIsValid = $event as boolean;
  }
}
