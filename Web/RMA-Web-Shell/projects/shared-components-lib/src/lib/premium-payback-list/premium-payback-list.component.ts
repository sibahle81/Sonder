import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { BankingDetailsDialogComponent } from '../banking-details-dialog/banking-details-dialog.component';
import { MobileNumberDialogComponent } from '../mobile-number-dialog/mobile-number-dialog.component';
import { NoteDialogComponent } from '../note-dialog/note-dialog.component';

import { PremiumPaybackStatusEnum } from 'projects/shared-models-lib/src/lib/enums/premium-payback-status.enum';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PremiumPaybackCase } from 'projects/shared-models-lib/src/lib/policy/premium-payback-case';
import { PremiumPaybackItem } from 'projects/shared-models-lib/src/lib/policy/premium-payback-item';

import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { WizardStatus } from '../wizard/shared/models/wizard-status.enum';
import { PremiumPaybackService } from './premium-payback.service';

@Component({
  selector: 'app-premium-payback-list',
  templateUrl: './premium-payback-list.component.html',
  styleUrls: ['./premium-payback-list.component.css']
})
export class PremiumPaybackListComponent extends WizardDetailBaseComponent<PremiumPaybackCase> implements AfterContentChecked, AfterViewInit {

  displayedColumns: string[] = [
    'policyNumber',
    'policyInceptionDate',
    'paybackDate',
    'premiumPaybackStatus',
    'paybackAmount',
    'accountType',
    'policyOwner',
    'mobileNumber',
    'paybackFailedReason',
    'action'
  ];

  sendingNotification: boolean = false;
  verifyingBankDetails: boolean = false;
  dataSource: MatTableDataSource<PremiumPaybackItem>;
  accountTypes: Lookup[] = [];

  @ViewChild('filter', { static: true }) filter: ElementRef;

  reportServer: string;
  ssrsBaseUrl: string;
  reportUrl: string;
  reportName: string;
  showParameters: string;
  reportFormat: string;
  parameters: any;
  language: string;
  width: number;
  height: number
  toolbar: string;

  isDownload = 'false';
  showReport = false;
  isDownloading = false;

  menus: { title: string, action: string, disable: boolean }[];

  get hideTable(): boolean {
    if (!this.model) { return true; }
    if (!this.model.paybackItems) { return true; }
    if (this.sendingNotification) { return true; }
    if (this.verifyingBankDetails) { return true; }
    return false;
  }

  get hideActions(): boolean {
    return this.context.wizard.wizardStatusId === WizardStatus.AwaitingApproval;
  }

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private dialogBox: MatDialog,
    private readonly alertService: AlertService,
    private readonly paybackService: PremiumPaybackService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly wizardService: WizardService,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngAfterViewInit(): void {
    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        tap(() => {
          this.filterData();
        })
      )
      .subscribe();
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  onLoadLookups(): void {
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe({
      next: (value: string) => {
        this.ssrsBaseUrl = value;
      }
    });
    this.lookupService.getBankAccountTypes().subscribe({
      next: (list: Lookup[]) =>{
        this.accountTypes = list;
      }
    });
  }

  createForm(): void {
    if (this.displayName.includes('Error')) {
      this.menus = [{ 
        title: 'Verify Bank Account', 
        action: 'verifyBank', 
        disable: false 
      }];
    } else {
      this.menus = [{ 
        title: 'Reject', 
        action: 'rejectPayment', 
        disable: false 
      }];
    }
  }

  populateForm(): void {
    let paybackItems: PremiumPaybackItem[] = [];
    if (this.context.wizard.wizardStatusId === WizardStatus.AwaitingApproval) {
      paybackItems = this.model.paybackItems.filter(s => s.premiumPaybackStatus === PremiumPaybackStatusEnum.BankAccountVerified);
    } else {
      paybackItems = this.model.paybackItems;
    }
    this.dataSource = new MatTableDataSource(paybackItems);
  }

  populateModel(): void {
    this.model.paybackItems = this.model.paybackItems;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getStatusString(statusId: PremiumPaybackStatusEnum): string {
    const status = PremiumPaybackStatusEnum[statusId];
    let result = status.replace(/([A-Z])/g, ' $1').trim();
    result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    return result;
  }

  showMenuItem(row: PremiumPaybackItem, menu: any): boolean {
    switch (menu.action) {
      case 'verifyBank':
        if (row.premiumPaybackStatus === PremiumPaybackStatusEnum.BankAccountError) {
          return this.context.wizard.canEdit;
        }
        break;
      case 'rejectPayment':
        if (row.premiumPaybackStatus === PremiumPaybackStatusEnum.BankAccountVerified) {
          return this.context.wizard.canEdit;
        }
        break;
    }
    return false;
  }

  onMenuItemClick(item: PremiumPaybackItem, menu: any): void {
    switch (menu.action) {
      case 'verifyBank':
        this.verifyBankAccount(item);
        break;
      case 'rejectPayment':
        this.rejectPaybackPayment(item);
        break;
    }
  }

  private rejectPaybackPayment(item: PremiumPaybackItem): void {
    const dialog = this.dialogBox.open(NoteDialogComponent, this.getRejectionDialogConfig(item));
    dialog.afterClosed().subscribe(
      (reason: string) => {
        if (reason) {
          // Pass a copy of the item to prevent front-end from updating prematurely
          const copy = { ...item };
          copy.premiumPaybackStatus = PremiumPaybackStatusEnum.PaybackFailed;
          copy.paybackFailedReason = reason;
          // 
          this.paybackService.rejectPaybackPayment(copy).subscribe({
            next: (payback: PremiumPaybackItem) => {
              item.premiumPaybackStatus = payback.premiumPaybackStatus;
              item.paybackFailedReason = payback.paybackFailedReason;
              item.notificationDate = payback.notificationDate;
              this.saveWizardData();
            },
            error: (response: HttpErrorResponse) => {
              const errorMessage = response.error?.Error ? response.error.Error : response.message;
              this.alertService.error(errorMessage, 'Rejection Error');
              this.sendingNotification = false;
            },
            complete: () => {
              this.sendingNotification = false;
            }
          });
        }
      }
    );
  }

  getRejectionDialogConfig(payback: PremiumPaybackItem): MatDialogConfig<any> {
    const config = new MatDialogConfig();
    config.data = {
      title: 'Rejection Reason'
    };
    return config;
  }

  private sendPaybackNotification(item: PremiumPaybackItem): void {
    const dialog = this.dialogBox.open(MobileNumberDialogComponent, this.getNotificationDialogConfig(item));
    dialog.afterClosed().subscribe(
      (newMobileNumber: string) => {
        if (newMobileNumber) {
          this.sendingNotification = true;
          item.mobileNumber = newMobileNumber;
          this.paybackService.sendPaybackNotification(item).subscribe({
            next: (payback: PremiumPaybackItem) => {
              item.premiumPaybackStatus = payback.premiumPaybackStatus;
              item.paybackFailedReason = payback.paybackFailedReason;
              item.notificationDate = payback.notificationDate;
              this.saveWizardData();
            },
            error: (response: HttpErrorResponse) => {
              const errorMessage = response.error.Error ? response.error.Error : response.message;
              this.alertService.error(errorMessage, 'Notification Error');
              this.sendingNotification = false;
            },
            complete: () => {
              this.sendingNotification = false;
            }
          });
        }
      }
    );
  }

  private getNotificationDialogConfig(payback: PremiumPaybackItem): MatDialogConfig {
    const config = new MatDialogConfig();
    config.data = {
      title: 'Mobile Number',
      mobileNumber: payback.mobileNumber
    };
    return config;
  }

  private verifyBankAccount(item: PremiumPaybackItem): void {
    const dialog = this.dialogBox.open(BankingDetailsDialogComponent, this.getBankVerificationDialogConfig(item));
    dialog.afterClosed().subscribe(
      (bankingDetail: RolePlayerBankingDetail) => {
        if (bankingDetail) {
          this.verifyingBankDetails = true;
          item.bankId = bankingDetail.bankId;
          item.bankBranchId = bankingDetail.bankBranchId;
          item.branchCode = bankingDetail.branchCode;
          item.bankAccountType = bankingDetail.bankAccountType;
          item.accountNumber = bankingDetail.accountNumber;
          this.paybackService.validatePaybackBankAccount(item).subscribe({
            next: (payback: PremiumPaybackItem) => {
              item.premiumPaybackStatus = payback.premiumPaybackStatus;
              item.paybackFailedReason = payback.paybackFailedReason;
              item.notificationDate = payback.notificationDate;
              this.saveWizardData();
            },
            error: (response: HttpErrorResponse) => {
              const errorMessage = response.error.Error ? response.error.Error : response.message;
              this.alertService.error(errorMessage, 'Bank Verification Error');
              this.verifyingBankDetails = false;
            },
            complete: () => {
              this.verifyingBankDetails = false;
            }
          });
        }
      }
    );
  }

  private getBankVerificationDialogConfig(payback: PremiumPaybackItem): MatDialogConfig {
    const config = new MatDialogConfig();
    config.data = {
      rolePlayerId: payback.rolePlayerId,
      bankId: payback.bankId,
      bankBranchId: payback.bankBranchId,
      branchCode: payback.branchCode,
      bankAccountType: payback.bankAccountType,
      accountNumber: payback.accountNumber
    };
    return config;
  }

  private saveWizardData() {
    const saveWizardRequest = this.context.createSaveWizardRequest();
    saveWizardRequest.updateLockedUser = true;
    saveWizardRequest.lockedToUser = this.authService.getUserEmail();
    saveWizardRequest.currentStep = this.context.wizard.currentStepIndex;
    this.wizardService.saveWizard(saveWizardRequest).subscribe();
  }

  filterData(): void {
    if (this.filter.nativeElement.value.length === 0) {
      this.resetFilter();
    } else {
      this.dataSource.filter = this.filter.nativeElement.value.trim();
    }
  }

  resetFilter(): void {
    this.filter.nativeElement.value = '';
    this.dataSource.filter = '';
  }

  exportReport(): void {
    this.isDownloading = true;
    this.isDownload = 'true';
    this.showReport = false;
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = 'RMA.Reports.ClientCare.Policy/PremiumPaybackWizardReport';
    this.reportName = this.context.wizard.name;
    this.parameters = { wizardId: this.context.wizard.id };
    this.showParameters = 'false';
    this.reportFormat = 'EXCEL';
    this.language = 'en-us';
    this.width = 100;
    this.height = 100;
    this.toolbar = 'true';
    this.showReport = true;
  }

  downLoadComplete(success: boolean): void {
    this.isDownloading = !success;
  }

  getBankAccountType(accountType: BankAccountTypeEnum): string {
    if (accountType && this.accountTypes.length > 0) {
      const bankAccountType = this.accountTypes.find(s => s.id === accountType);
      if (bankAccountType) {
        return bankAccountType.name;
      }
    }
    return '';
  }
}
