import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApprovalRequest } from '../../shared/models/approval-request';
import { ApprovalType } from '../../shared/models/approval-type.enum';
import { ProgressMessage } from '../../shared/models/progress-message';
import { RejectWizardRequest } from '../../shared/models/reject-wizard-request';
import { WizardContext } from '../../shared/models/wizard-context';
import { WizardStatus } from '../../shared/models/wizard-status.enum';
import { WizardService } from '../../shared/services/wizard.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'wizard-submit-step',
  templateUrl: './wizard-submit-step.component.html'
})
export class WizardSubmitStepComponent {

  wizardContext: WizardContext;
  progressMessage: ProgressMessage;
  isSubmitting = false;
  submitSuccess: boolean;
  isApprovalRequested = false;
  isApprovalResolved = false;
  wizardStatus: WizardStatus;

  get rejected(): number {
    return WizardStatus.Rejected;
  }

  get disputed(): number {
    return WizardStatus.Disputed;
  }

  constructor(
    private readonly wizardService: WizardService,
    private readonly router: Router,
    private readonly authService: AuthService) {
  }

  navigate(url: string) {
    this.router.navigate([url]);
  }

  back(): void {
    this.router.navigate([this.wizardContext.backLink]);
  }

  submitWizard(wizardContext: WizardContext) {
    this.isSubmitting = true;
    this.wizardContext = wizardContext;

    this.wizardService.submitWizard(this.wizardContext.wizard.id)
      .subscribe(submitResult => {
        this.submitSuccess = submitResult;
        this.authService.changeNotifications(true);
        this.router.navigate([this.wizardContext.backLink]);
      });
  }

  requestApproval(wizardContext: WizardContext) {
    this.isSubmitting = true;
    this.wizardContext = wizardContext;

    this.wizardService.requestApproval(this.wizardContext.wizard.id)
      .subscribe(() => {
        this.isApprovalRequested = true;
        this.isSubmitting = false;
        this.wizardContext.data = null;
        this.wizardContext.onApprovalRequested();
      });
  }

  resolveApproval(wizardContext: WizardContext, approvalRequest: ApprovalRequest): void {
    if (approvalRequest.approvalType === ApprovalType.Approve) {
      this.approveWizard(wizardContext);
    } else {
      this.rejectWizard(wizardContext, approvalRequest);
    }
  }

  approveWizard(wizardContext: WizardContext): void {
    this.isSubmitting = true;
    this.wizardContext = wizardContext;

    this.wizardService.approveWizard(this.wizardContext.wizard.id)
      .subscribe(submitResult => {
        this.submitSuccess = submitResult;
        this.isApprovalResolved = true;
        this.isSubmitting = false;
      });
  }

  rejectWizard(wizardContext: WizardContext, approvalRequest: ApprovalRequest) {
    this.isSubmitting = true;
    this.wizardContext = wizardContext;
    const currentUser = this.authService.getCurrentUser().displayName;
    const rejectWizardRequest = new RejectWizardRequest(wizardContext.wizard.id, approvalRequest.comment, currentUser);

    if (approvalRequest.approvalType === ApprovalType.Dispute) {
      this.wizardService.disputeWizard(rejectWizardRequest)
        .subscribe(() => {
          this.wizardStatus = WizardStatus.Disputed;
          this.done();
        });
    } else {
      this.wizardService.rejectWizard(rejectWizardRequest).subscribe(() => {
        this.wizardStatus = WizardStatus.Rejected;
        this.done();
      });
    }
  }

  done(): void {
    this.isApprovalResolved = true;
    this.isSubmitting = false;
  }

  rejectWizardWithCondition(wizardContext: WizardContext, data: any) {
    // this.isSubmitting = true;
    // this.wizardContext = wizardContext;
    // let note: string;

    // note = (data as Case).mainMember.policies[0].policyNotes[0] ? (data as Case).mainMember.policies[0].policyNotes[0].text : '';
    // const currentUser = this.authService.getCurrentUser().displayName;
    // const rejectWizardRequest = new RejectWizardRequest(wizardContext.wizard.id, note, currentUser);
    // this.wizardService.rejectOnCondition(rejectWizardRequest).subscribe(() => {
    //   this.wizardStatus = WizardStatus.Rejected;
    //   this.done();
    // });
  }
}
