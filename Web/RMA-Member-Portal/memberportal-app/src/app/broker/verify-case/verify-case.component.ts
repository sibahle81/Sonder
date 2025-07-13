import { Component, Output } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { EventEmitter } from "events";
import { AuthService } from "src/app/core/services/auth.service";
import { AppEventsManager } from "src/app/shared-utilities/app-events-manager/app-events-manager";
import { ValidationResult } from "src/app/shared/components/wizard/shared/models/validation-result";
import { WizardDetailBaseComponent } from "src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component";
import { CaseType } from "src/app/shared/enums/case-type.enum";

import { DocumentSetEnum } from "src/app/shared/enums/document-set.enum";
import { ApprovalRequest } from "src/app/shared/models/approval-request.model";
import { Case } from "src/app/shared/models/case";
import { RolePlayer } from "src/app/shared/models/roleplayer";


@Component({
  selector: 'app-verify-case',
  templateUrl: './verify-case.component.html',
  styleUrls: ['./verify-case.component.css']
})

export class VerifyCaseComponent extends WizardDetailBaseComponent<Case>  {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onApprovalSubmit = new EventEmitter<ApprovalRequest>();

  get showIntemediaries(): boolean {
    if (!this.model) { return false; }
    return this.model.brokerage !== null && this.model.brokerage !== undefined && this.model.representative !== null && this.model.representative !== undefined;
  }

  get documentSetId(): number {
    if (this.model) {
      switch (this.model.caseTypeId) {
        case CaseType.IndividualNewBusiness:
          return DocumentSetEnum.PolicyCaseIndividual;
        case CaseType.GroupNewBusiness:
          return DocumentSetEnum.PolicyCaseGroup;
        default:
          return 0;
      }
    } else {
      return 0;
    }
  }

  get showPolicyDocuments(): boolean {
    if (this.model.mainMember) {
      return this.model.mainMember.person && !this.isWizard;
    } else {
      return false;
    }
  }

  get showGroupPolicyDocuments(): boolean {
    if (this.model.mainMember) {
      return !this.model.mainMember.person && !this.isWizard;
    } else {
      return false;
    }
  }

  policyNumber: string;
  hasJuristicRepresentative = false;
  docKey: string;
  individualPolicyDocsDocSetId = DocumentSetEnum.PolicyDocumentsindividual;
  groupPolicyDocsDocSetId = DocumentSetEnum.PolicyDocumentsgroup;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: FormBuilder
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      representativeName: new FormControl({ value: '', disabled: true }),
      brokerageName: new FormControl({ value: '', disabled: true }),
      juristiceRepresentative: new FormControl({ value: '', disabled: true }),
      mainMemberName: new FormControl({ value: '', disabled: true }),
      policyNumber: new FormControl({ value: '', disabled: true }),
      idNumber: new FormControl({ value: '', disabled: true })
    });
  }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void {
    if (this.model.mainMember && this.model.mainMember.policies && this.model.mainMember.policies) {
      this.policyNumber = this.model.mainMember.policies[0].policyNumber;
      this.form.patchValue({
        policyNumber: this.policyNumber
      });
    }

    this.hasJuristicRepresentative = this.model.juristicRepresentative ? true : false;
    this.form.patchValue({
      juristiceRepresentative: this.model.juristicRepresentative ? `${this.model.juristicRepresentative.code}: ${this.model.juristicRepresentative.firstName} ${this.model.juristicRepresentative.surnameOrCompanyName}` : ''
    });

    if (this.model.mainMember) {
      this.form.patchValue({
        mainMemberName: this.model.mainMember.displayName,
        idNumber: this.getIdNumber(this.model.mainMember)
      });
    }

    if (this.model.caseTypeId !== CaseType.MemberRelations) {
      if (this.model.brokerage && this.model.representative) {
        this.form.patchValue({
          brokerageName: this.model.brokerage.name,
          representativeName: this.model.representative.name
        });
      }
    }

    this.docKey = this.model.code;
  }

  getIdNumber(member: RolePlayer): string {
    if (!member.person) { return ''; }
    return member.person.idNumber;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
