import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApprovalRequest } from '../../shared/models/approval-request';
import { ApprovalType } from '../../shared/models/approval-type.enum';
import { WizardContext } from '../../shared/models/wizard-context';
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

  form: FormGroup;
  wizardContext: WizardContext;
  approvalType: ApprovalType;
  hideDispute = false;

  // add wizardconfigid to string array to hide dispute button on approval step e.g ['11', '32', '35', '48'];
  nonDisputableWizardConfigurationIds = ['11', '32', '35', '48'];

  get approvalTypeText(): string {
    switch (this.approvalType) {
      case ApprovalType.Approve:
        return 'Approve';
      case ApprovalType.Dispute:
        return 'Dispute';
      default:
        return 'Reject';
    }
  }

  constructor(
    readonly router: Router,
    readonly formBuilder: FormBuilder,
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
    if (this.form.invalid) { return; }
    const comment = this.readForm();

    const approvalRequest = new ApprovalRequest(approvalType, comment);
    this.onApprovalSubmit.emit(approvalRequest);
  }

  canDispute() {
    // do not replace '==' with '===' in this case
    const x = this.nonDisputableWizardConfigurationIds.filter(s => s === this.wizardContext.wizard.wizardConfigurationId);
    this.hideDispute = x.length > 0;
  }

  back(): void {
    this.onBackClick.emit();
  }

  close(): void {
    this.router.navigate([this.wizardContext.backLink]);
  }
}
