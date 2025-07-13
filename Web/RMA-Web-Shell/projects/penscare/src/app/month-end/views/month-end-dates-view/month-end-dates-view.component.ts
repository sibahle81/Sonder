import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';
import { MonthEndRunStatusEnum } from '../../../shared-penscare/enums/mont-end-run-status-enum';
import { MonthEndDateDetail } from '../../../shared-penscare/models/month-end-date-detail';
import { ConfirmationDialogsService } from '../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MatDialog } from '@angular/material/dialog';
import { DefaultConfirmationDialogComponent } from '../../../../../../shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { AlertService } from '../../../../../../shared-services-lib/src/lib/services/alert/alert.service';
import { MonthEnum } from '../../../../../../shared-models-lib/src/lib/enums/month.enum';

@Component({
  selector: 'pension-month-end-dates-view',
  templateUrl: './month-end-dates-view.component.html',
  styleUrls: ['./month-end-dates-view.component.css']
})
export class MonthEndDatesViewComponent implements OnInit {
  monthEndDate: MonthEndDateDetail;
  monthEndRunDateId: number;
  tabIndex: number;

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly pensionMonthEndService: PenscareMonthEndService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly dialog: MatDialog,
    private readonly alert: AlertService
  ) { }
  

  ngOnInit(): void {
    this.monthEndRunDateId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getMonthEndRunDate();
  }


  queueMonthEndProcessing() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent,{
        width: "40%",
        disableClose: true,
        data: {
          title: "Start Month End Run?",
          text: "Are you sure you want to proceed?"
        }
      });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading$.next(true);
        this.pensionMonthEndService.queueMonthEndRun(this.monthEndRunDateId).subscribe((result) => {
          this.isLoading$.next(false);
          if (result) {
            this.monthEndDate.monthEndRunStatus = MonthEndRunStatusEnum.ProcessingMonthlyLedgers;
            this.alert.success("Month end run scheduled.", "Month End Run");
          }
          else
            this.alert.error("An error occured while scheduling the month end run.", "Month End Run");

          this.getMonthEndRunDate();
            
        });
      }
    });
  }

  queueMonthEndRelease() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: "40%",
      disableClose: true,
      data: {
        title: "Release Payments?",
        text: "Are you sure you want to proceed?"
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.pensionMonthEndService.queueMonthEndRunRelease(this.monthEndRunDateId).subscribe((result) => {
          if (result) {
            this.monthEndDate.monthEndRunStatus = MonthEndRunStatusEnum.ProcessingPayments;
            this.alert.success("Payments release scheduled.", "Release Payments");
          }
          else
            this.alert.error("An error occured while scheduling payments release.", "Release Payments");

        });
      }
    });
  }

  get monthEndQueued(): boolean {
    if (this.monthEndDate) {
      return (this.monthEndDate.monthEndRunStatus != MonthEndRunStatusEnum.Awaiting);
    }
    return false;
  }

  get canReleasePayments(): boolean {
    if (this.monthEndDate) {
      return (this.monthEndDate.monthEndRunStatus == MonthEndRunStatusEnum.MonthlyLedgersProcessed || this.monthEndDate.monthEndRunStatus == MonthEndRunStatusEnum.PaymentsFailed);
    }
    return false;
  }

  getMonthEndRunDate(): void {
    this.isLoading$.next(true);
    this.pensionMonthEndService.getMonthEndRunDateDetail(this.monthEndRunDateId).subscribe(result => {
      if (result) {
        this.monthEndDate = result;
        this.isLoading$.next(false);
      }
    });
  }

  formatLookup(lookup: string): string {
    if (!lookup || lookup == '') { return 'N/A'; }
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  getRunMonth(runMonth: MonthEnum) {
    return this.formatLookup(MonthEnum[runMonth]);
  }

  getRunStatus(runStatus: MonthEndRunStatusEnum) {
    return this.formatLookup(MonthEndRunStatusEnum[runStatus]);
  }

  get isProcessingLedgers(): boolean {
    if (this.monthEndDate) {
      return this.monthEndDate.monthEndRunStatus == MonthEndRunStatusEnum.ProcessingMonthlyLedgers;
    }

    return false;
  }

}
