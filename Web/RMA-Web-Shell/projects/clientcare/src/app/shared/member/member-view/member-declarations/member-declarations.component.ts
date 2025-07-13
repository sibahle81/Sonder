import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { BehaviorSubject } from 'rxjs';
import { VarianceConfirmationDialogComponent } from './variance-confirmation-dialog/variance-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AssistanceRequestDialogComponent } from 'projects/shared-components-lib/src/lib/declarations/renewals/assistance-request-dialog/assistance-request-dialog.component';
import "src/app/shared/extensions/date.extensions";
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { RefreshService } from '../../../refresh-service/refresh-service';
import { RolePlayerPolicyDeclarationDetail } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration-detail';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { RolePlayerPolicyDeclarationContext } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration-context';

@Component({
  selector: 'member-declarations',
  templateUrl: './member-declarations.component.html',
  styleUrls: ['./member-declarations.component.css']
})
export class MemberDeclarationsComponent extends UnSubscribe implements OnChanges {

  @Input() rolePlayerId: number;
  @Input() isReadOnly = false;

  @Output() policiesWithOutstandingSubmissionsEmit: EventEmitter<Policy[]> = new EventEmitter();

  public reviewInProgress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isAssistanceRequested$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  policies: Policy[];

  requiresSubmission: boolean;
  isMining: boolean;
  refresh: boolean;

  applyAll = true;

  constructor(
    private readonly declarationService: DeclarationService,
    private readonly wizardService: WizardService,
    private readonly alert: ToastrManager,
    public dialog: MatDialog,
    private readonly refreshService: RefreshService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.getRolePlayerPolicyDeclarations();
    }
  }

  getRolePlayerPolicyDeclarations() {
    this.loadingMessage$.next('loading declarations...please wait');
    this.declarationService.getRequiredRenewalRolePlayerPolicyDeclarations(this.rolePlayerId).subscribe(result => {
      this.policies = result;
      if (this.policies && this.policies.length > 0) {
        this.isMining = this.policies[0].policyOwner.company.industryClass == IndustryClassEnum.Mining;
      }
      this.requiresSubmission = this.policies && this.policies?.length > 0;
      this.policiesWithOutstandingSubmissionsEmit.emit(this.policies);
      this.isLoading$.next(false);
    });
  }

  canSubmit(): boolean {
    const allValid = !this.policies.some(s => s.rolePlayerPolicyDeclarations.some(s => !s.totalPremium || s.totalPremium === 0));
    const allVarianceHasReasons = this.policies.some(p => p.rolePlayerPolicyDeclarations.some(s => s.variancePercentage && s.variancePercentage !== 0 && s.varianceReason && s.varianceReason != ''));
    return allValid && ((this.hasVariance() && allVarianceHasReasons) || !this.hasVariance());
  }

  hasVariance(): boolean {
    return this.policies.some(p => p.rolePlayerPolicyDeclarations.some(s => s.variancePercentage && s.variancePercentage !== 0));
  }

  submit() {
    if (!this.canSubmit()) {
      this.openCanSubmitDialog();
    } else if (this.hasVariance()) {
      this.openVarianceConfirmationDialog();
    } else {
      this.openConfirmationDialog();
    }
  }

  save() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('submitting declarations...please wait');

    this.declarationService.renewPolicies(this.policies).subscribe(result => {
      this.getRolePlayerPolicyDeclarations();
      this.triggerRefresh();
    });
  }

  openCanSubmitDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Incomplete Declaration Submission`,
        text: `Please complete all the required information before you submit`,
        showConfirmButton: false
      }
    });
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Declaration Submission Confirmation`,
        text: `Are you sure you want to submit?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.save();
      }
    });
  }

  openVarianceConfirmationDialog() {
    const dialogRef = this.dialog.open(VarianceConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        policies: this.policies
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startVarianceWizard();
      }
    });
  }

  openAssistanceRequestDialog() {
    const dialogRef = this.dialog.open(AssistanceRequestDialogComponent, {
      width: '40%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startAssistanceWizard();
      }
    });
  }

  startVarianceWizard() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('requesting variance review');

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.rolePlayerId;
    startWizardRequest.type = 'declaration-variance';

    const policiesForReview = JSON.parse(JSON.stringify(this.policies)) as Policy[]; // creates a deep copy
    const policiesForSubmission = JSON.parse(JSON.stringify(this.policies)) as Policy[]; // creates a deep copy

    policiesForReview.forEach(policy => {
      while (policy.rolePlayerPolicyDeclarations.some(p => !p.variancePercentage || p.variancePercentage == 0)) {
        const index = policy.rolePlayerPolicyDeclarations.findIndex(s => !s.variancePercentage || s.variancePercentage == 0);
        policy.rolePlayerPolicyDeclarations.splice(index, 1);
      }
    });

    policiesForSubmission.forEach(policy => {
      while (policy.rolePlayerPolicyDeclarations.some(p => p.variancePercentage && p.variancePercentage != 0)) {
        const index = policy.rolePlayerPolicyDeclarations.findIndex(s => s.variancePercentage && s.variancePercentage != 0);
        policy.rolePlayerPolicyDeclarations.splice(index, 1);
      }
    });

    const varianceWizardData = policiesForReview.filter(s => s.rolePlayerPolicyDeclarations && s.rolePlayerPolicyDeclarations?.length > 0);
    this.policies = policiesForSubmission.filter(s => s.rolePlayerPolicyDeclarations && s.rolePlayerPolicyDeclarations?.length > 0);

    startWizardRequest.data = JSON.stringify(varianceWizardData);

    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alert.infoToastr('Variance review requested successfully...');
      this.save();
    });
  }

  startAssistanceWizard() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('requesting assistance...please wait');

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.rolePlayerId;
    startWizardRequest.type = 'declaration-assistance';
    startWizardRequest.data = JSON.stringify(this.policies);

    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.triggerRefresh();
      this.alert.infoToastr('Assistance requested successfully...');
      this.isLoading$.next(false);
    });
  }

  setUnderReview($event: boolean) {
    this.reviewInProgress$.next($event);
  }

  setAssistanceRequested($event: boolean) {
    this.isAssistanceRequested$.next($event);
  }

  triggerRefresh() {
    this.refreshService.triggerRefresh();
  }

  applyAllChanged($event: boolean) {
    this.applyAll = $event;
  }

  applyToAll($event: RolePlayerPolicyDeclarationContext) {
    if (this.applyAll) {
      this.policies.forEach(policy => {
        policy.rolePlayerPolicyDeclarations.forEach(rolePlayerPolicyDeclaration => {
          if ($event.rolePlayerPolicyDeclaration.declarationYear == rolePlayerPolicyDeclaration.declarationYear) {
            rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.forEach(rolePlayerPolicyDeclarationDetail => {
              if (!rolePlayerPolicyDeclarationDetail.isDeleted &&
                rolePlayerPolicyDeclarationDetail.categoryInsured == $event.rolePlayerPolicyDeclarationDetail.categoryInsured &&
                (!rolePlayerPolicyDeclarationDetail.premium || rolePlayerPolicyDeclarationDetail.premium <= 0)) {
                rolePlayerPolicyDeclarationDetail.averageNumberOfEmployees = $event.rolePlayerPolicyDeclarationDetail.averageNumberOfEmployees;
                rolePlayerPolicyDeclarationDetail.averageEmployeeEarnings = $event.rolePlayerPolicyDeclarationDetail.averageEmployeeEarnings;

                rolePlayerPolicyDeclarationDetail.liveInAllowance = this.isMining && rolePlayerPolicyDeclarationDetail.categoryInsured == CategoryInsuredEnum.Unskilled ? $event.rolePlayerPolicyDeclarationDetail.liveInAllowance : null;
              }
            });
          }
        });
      });
      this.refresh = !this.refresh;
    }
  }
}
