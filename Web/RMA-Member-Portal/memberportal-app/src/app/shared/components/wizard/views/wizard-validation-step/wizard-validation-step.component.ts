import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { WizardContext } from '../../shared/models/wizard-context';
import { WizardService } from '../../shared/services/wizard.service';
import { ValidationResult } from '../../shared/models/validation-result';
import { WizardStatus } from '../../shared/models/wizard-status.enum';
import { RuleRequestResult } from '../../../rules-engine/shared/models/rule-request-result';
import { WizardApprovalStepComponent } from '../wizard-approval-step/wizard-approval-step.component';
import { ApprovalRequest } from '../../shared/models/approval-request';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'wizard-validation-step',
  templateUrl: './wizard-validation-step.component.html'
})
export class WizardValidationStepComponent {
  @ViewChild(WizardApprovalStepComponent) wizardApprovalStepComponent: WizardApprovalStepComponent;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onValidationComplete = new EventEmitter<boolean>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onNavigate = new EventEmitter<number>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onBackClick = new EventEmitter();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onApprovalSubmit = new EventEmitter<ApprovalRequest>();

  constructor(readonly router: Router, private readonly wizardService: WizardService) {
  }

  ruleRequestResult: RuleRequestResult;
  isActiveWizard = true;
  wizardContext: WizardContext;
  validationResults: ValidationResult[];

  // get isValidationValid(): boolean { return this.areFormsValid; }
  get isValidationValid(): boolean { return this.areFormsValid && this.areRulesValid; }

  // get isValidationComplete(): boolean { return this.isFromValidationComplete; }
  get isValidationComplete(): boolean { return this.isFromValidationComplete && this.isRulesValidationComplete; }

  get hasPendingResults(): boolean {
    if (!this.validationResults) { return false; }
    return this.validationResults.findIndex(validationResult => validationResult.isPending === true) > 0;
  }

  areFormsValid = false;
  areRulesValid = false;
  isFromValidationComplete = false;
  isRulesValidationComplete = false;

  awaitingApproval = WizardStatus.AwaitingApproval;

  validate(wizardContext: WizardContext): void {
    this.wizardContext = wizardContext;
    this.areFormsValid = false;
    this.areRulesValid = false;
    this.isFromValidationComplete = false;
    this.isRulesValidationComplete = false;

    this.validateForms(wizardContext);
    if ( this.areFormsValid ) {
      this.validateRules(wizardContext);
     }
  }

  validateForms(wizardContext: WizardContext): void {
    if ((wizardContext.wizard.wizardStatusId !== WizardStatus.InProgress) && (wizardContext.wizard.wizardStatusId !== WizardStatus.Disputed) && !wizardContext.hasApprovalStep) {
      this.isActiveWizard = false;
    } else {
      this.validationResults = new Array();
      this.areFormsValid = true;
      this.isFromValidationComplete = false;

      wizardContext.stepComponents.forEach(component => {
        try {
          wizardContext.currentData = wizardContext.getDataByName(component.firstName);
          const result = component.wizardValidateForm(wizardContext);
          this.validationResults.push(result);

          if (!result.valid) {
            this.areFormsValid = false;
          }

          if (result.isPending) {
            result.statusChange.subscribe(status => {
              result.isPending = false;

              if (status !== 'VALID') {
                result.errors++;
              }

              this.areFormsValid = this.validationResults.findIndex(validationResult => validationResult.valid === false) < 0;
            });
          }

        } catch (error) {
          const result = new ValidationResult(`${component.displayName} (validation failed)`);
          result.errorMessages = ['An error occured during validation' + error];
          this.areFormsValid = false;
          result.errors++;

          this.validationResults.push(result);
        }
      });

      this.isFromValidationComplete = true;
      this.validationComplete();
    }
  }

  validateRules(wizardContext: WizardContext): void {
    this.ruleRequestResult = null;

    this.wizardService.executeWizardRules(wizardContext.wizard.id)
      .subscribe(ruleRequestResult => this.executedRulesCompleted(ruleRequestResult));
  }

  executedRulesCompleted(ruleRequestResult: RuleRequestResult): void {
    this.ruleRequestResult = ruleRequestResult;
    this.isRulesValidationComplete = true;
    this.areRulesValid = this.ruleRequestResult.overallSuccess;
    this.validationComplete();
  }

  validationComplete(): void {
    if (this.isValidationComplete) {
      this.onValidationComplete.emit(this.isValidationValid);

      if (this.wizardContext && this.wizardContext.wizard.wizardStatusId === WizardStatus.AwaitingApproval && this.wizardContext.hasApprovalStep &&
        this.areFormsValid && this.areRulesValid) {
        this.wizardApprovalStepComponent.startApproval(this.wizardContext);
      }
    }
  }

  navigate(step: number): void {
    this.onNavigate.emit(step);
  }

  getTypeOf(val) {
    if (val === null) {
      return 'string';
    }
    const temp = typeof val;
    return temp;
  }

  back(): void {
    this.onBackClick.emit();
  }

  getRuleResults(messages: string[]): string[] {
    let list: string[] = [];
    if (messages) {
      if (messages.length > 2) {
        for (let i = 0; i < 2; i++) {
          list.push(messages[i]);
        }
      } else {
        list = messages;
      }
    }
    return list;
  }

  approve(approvalRequest: ApprovalRequest): void {
    this.onApprovalSubmit.emit(approvalRequest);
  }
}
