import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { WizardContext } from '../../shared/models/wizard-context';
import { ApprovalType } from '../../shared/models/approval-type.enum';
import { ApprovalRequest } from '../../shared/models/approval-request';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardService } from '../../shared/services/wizard.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'wizard-approval-step',
  templateUrl: './wizard-approval-step.component.html'
})
export class WizardApprovalStepComponent implements OnInit {
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onApprovalSubmit = new EventEmitter<ApprovalRequest>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onBackClick = new EventEmitter();

  form: UntypedFormGroup;
  wizardContext: WizardContext;
  approvalType: ApprovalType;
  hideDispute = false;

  // add wizardconfigid to string array to hide dispute button on approval step e.g ['11', '32', '35', '48'];
  nonDisputableWizardConfigurationIds = ['60'];

  get approvalTypeText(): string {
    switch (this.approvalType) {
      case ApprovalType.Approve:
        return 'Approval';
      case ApprovalType.Dispute:
        return 'Dispute';
      default:
        return 'Reject';
    }
  }

  get premiumListingApproval(): boolean {
    if (!this.wizardContext.wizard.canApprove) { return false; }
    // tslint:disable-next-line:triple-equals
    if (this.wizardContext.wizard.wizardConfigurationId != '24') { return false; }
    if (this.wizardContext.wizard.wizardStatusId !== 4) { return false; }
    if (this.wizardContext.wizard.currentStepIndex !== 6) { return false; }
    return true;
  }

  get canSendDocuments(): boolean {
    if (!this.premiumListingApproval) { return false; }
    const data = this.wizardContext.data;
    return data[0].membersUploaded;
  }

  constructor(
    readonly router: Router,
    readonly formBuilder: UntypedFormBuilder,
    readonly authService: AuthService,
    readonly wizardService: WizardService) {
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      id: '',
      text: ['', [Validators.required, Validators.minLength(15)]],
    });
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.text.trim() as string;
  }

  startApproval(wizardContext: WizardContext): void {
    this.approvalType = null;
    this.wizardContext = wizardContext;
    this.canDispute();
  }

  confirm(approvalType: ApprovalType): void {
    this.approvalType = approvalType;
  }

  cancelConfirm(): void {
    this.approvalType = null;
  }

  approve(): void {
    const approvalRequest = new ApprovalRequest(ApprovalType.Approve, null);
    this.onApprovalSubmit.emit(approvalRequest);
  }

  dispute(): void {
    this.rejectWithNote(ApprovalType.Dispute);
  }

  reject(): void {
    this.rejectWithNote(ApprovalType.Reject);
  }

  rejectWithNote(approvalType: ApprovalType): void {
    const comment = this.readForm().trim();
    if (String.isNullOrEmpty(comment)) {
      this.form.get('text').setErrors({required: true});
      this.form.get('text').markAsTouched();
    }

    if (this.form.invalid) { return; }

    const approvalRequest = new ApprovalRequest(approvalType, comment);
    this.onApprovalSubmit.emit(approvalRequest);
  }

  canDispute() {
    // tslint:disable-next-line:triple-equals
    const x = this.nonDisputableWizardConfigurationIds.filter(s => s == this.wizardContext.wizard.wizardConfigurationId);
    this.hideDispute = x.length > 0;
  }

  back(): void {
    this.onBackClick.emit();
  }

  close(): void {
    this.router.navigate([this.wizardContext.backLink]);
  }
}
