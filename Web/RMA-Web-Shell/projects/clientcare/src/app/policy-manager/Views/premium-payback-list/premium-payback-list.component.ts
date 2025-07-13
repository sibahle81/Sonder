import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { MobileNumberDialogComponent } from '../mobile-number-dialog/mobile-number-dialog.component';
import { PremiumPaybackStatusEnum } from '../../shared/enums/premium-payback-status.enum';
import { PremiumPaybackService } from '../../shared/Services/premium-payback.service';
import { PremiumPaybackCase } from '../../shared/entities/premium-payback-case';
import { PremiumPaybackItem } from '../../shared/entities/premium-payback-item';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { BankingDetailsDialogComponent } from '../banking-details-dialog/banking-details-dialog.component';

@Component({
  selector: 'app-premium-payback-list',
  templateUrl: './premium-payback-list.component.html',
  styleUrls: ['./premium-payback-list.component.css']
})
export class PremiumPaybackListComponent extends WizardDetailBaseComponent<PremiumPaybackCase> implements AfterContentChecked {

  displayedColumns: string[] = [
    'policyNumber',
    'policyInceptionDate',
    'paybackDate',
    'premiumPaybackStatus',
    'paybackAmount',
    'policyOwner',
    'mobileNumber',
    'notificationDate',
    'paybackFailedReason',
    'action'
  ];

  sendingNotification: boolean = false;
  verifyingBankDetails: boolean = false;
  private readonly bankError: string = 'Bank Account Error';

  menus: { title: string, action: string, disable: boolean }[];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private dialogBox: MatDialog,
    private readonly alertService: AlertService,
    private readonly paybackService: PremiumPaybackService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly wizardService: WizardService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  onLoadLookups(): void { }

  createForm(): void {
    this.menus =
      [
        { title: 'Send Notification', action: 'notification', disable: false },
        { title: 'Verify Bank Account', action: 'verifyBank', disable: false }
      ];
  }

  populateForm(): void { }

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

  hideMenu(status: number): boolean {
    if (status === 5) { return false; }
    if (status === 8) { return false; }
    return true;
  }

  showMenuItem(row: PremiumPaybackItem, menu: any): boolean {
    switch (menu.action) {
      case 'notification':
        if (row.premiumPaybackStatus === PremiumPaybackStatusEnum.NotificationFailed) {
          return true;
        }
        break;
      case 'verifyBank':
        if (row.premiumPaybackStatus === PremiumPaybackStatusEnum.PaybackFailed && row.paybackFailedReason.indexOf(this.bankError) >= 0) {
          return true;
        }
        break;
    }
    return false;
  }

  onMenuItemClick(item: PremiumPaybackItem, menu: any): void {
    switch (menu.action) {
      case 'notification':
        this.sendPaybackNotification(item);
        break;
      case 'verifyBank':
        this.verifyBankAccount(item);
        break;
    }
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

}
