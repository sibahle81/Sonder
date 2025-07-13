import { Component, Output, EventEmitter, AfterViewInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Case } from '../../shared/entities/case';
import { ApprovalRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/approval-request';
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { CaseTypeEnum } from '../../shared/enums/case-type.enum';
import { InsurerEnum } from 'projects/shared-components-lib/src/lib/wizard/shared/models/insurer.enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PolicyService } from '../../shared/Services/policy.service';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-verify-case',
  templateUrl: './verify-case.component.html',
  styleUrls: ['./verify-case.component.css']
})

export class VerifyCaseComponent extends WizardDetailBaseComponent<Case> implements AfterContentChecked {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onApprovalSubmit = new EventEmitter<ApprovalRequest>();

  get showIntemediaries(): boolean {
    if (!this.model) { return false; }
    if (this.model.caseTypeId === CaseType.MemberRelations || this.model.caseTypeId === CaseType.MovePolicies) { return false; }
    return this.model.brokerage !== null && this.model.brokerage !== undefined && this.model.representative !== null && this.model.representative !== undefined;
  }

  get documentSetId(): number {
    if (this.model) {
      switch (this.model.caseTypeId) {
        case CaseType.IndividualNewBusiness:
          return DocumentSetEnum.PolicyCaseIndividual;
        case CaseType.GroupNewBusiness:
          return DocumentSetEnum.PolicyCaseGroup;
        case CaseType.CancelPolicy:
          return DocumentSetEnum.PolicyCancellation;
        case CaseType.MaintainPolicyChanges:
          return DocumentSetEnum.PolicyMaintanance;
        case CaseType.MovePolicies:
          return DocumentSetEnum.MoveBrokerPolicies;
        case CaseType.MemberRelations:
          return DocumentSetEnum.MemberRelations;
        case CaseType.ContinuePolicy:
          return DocumentSetEnum.PolicyContinuation;
        case CaseType.ReinstatePolicy:
          return DocumentSetEnum.PolicyReinstatement;
        case CaseType.ChangePolicyStatus:
          return DocumentSetEnum.PolicyStatusChange;
        default:
          return 0;
      }
    } else {
      return 0;
    }
  }

  get showPolicyDocuments(): boolean {
    if (this.model.mainMember) {
      return this.model.mainMember.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person && !this.isWizard;
    } else {
      return false;
    }
  }

  get showGroupPolicyDocuments(): boolean {
    if (this.model.mainMember) {
      if (!isNullOrUndefined(this.model.mainMember.rolePlayerIdentificationType)) {
        return this.model.mainMember.rolePlayerIdentificationType !== RolePlayerIdentificationTypeEnum.Person && !this.isWizard;
      }
    }
    return false;
  }

  get isChangeMembersCase(): boolean {
    if (!this.model) { return false; }
    if (!this.model.caseTypeId) { return false; }
    return this.model.caseTypeId === CaseType.MemberRelations;
  }

  policyNumber: string;
  docKey: string;
  policyId : number;
  hasJuristicRepresentative = false;
  individualPolicyDocsDocSetId = DocumentSetEnum.PolicyDocumentsIndividual;
  groupPolicyDocsDocSetId = DocumentSetEnum.PolicyDocumentsGroup;
  insurers: Lookup[] = [];
  loadingInsurers = false;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly policyService: PolicyService,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      representativeName: new UntypedFormControl({ value: '', disabled: true }),
      brokerageName: new UntypedFormControl({ value: '', disabled: true }),
      juristiceRepresentative: new UntypedFormControl({ value: '', disabled: true }),
      mainMemberName: new UntypedFormControl({ value: '', disabled: true }),
      policyNumber: new UntypedFormControl({ value: '', disabled: true }),
      idNumber: new UntypedFormControl({ value: '', disabled: true }),
      insurerId: []
    });
    this.form.get('insurerId').disable();
  }

  onLoadLookups(): void {
    this.loadingInsurers = true;
    this.policyService.getPolicyInsurers().subscribe({
      next: (data) => this.insurers = data,
      complete: () => this.loadingInsurers = false
    });
  }

  populateForm(): void {
    if (this.model.mainMember && this.model.mainMember.policies && this.model.mainMember.policies) {
      this.policyNumber = this.model.mainMember.policies[0].policyNumber;
      const policy = this.model.mainMember.policies[0];
      this.form.patchValue({
        policyNumber: this.policyNumber,
        insurerId: (policy && policy.insurerId > 0) ? policy.insurerId : InsurerEnum.RandMutualAssurance
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

    if (this.model.caseTypeId !== CaseTypeEnum.MemberRelations) {
      if (this.model.brokerage && this.model.representative) {
        this.form.patchValue({
          brokerageName: this.model.brokerage.name,
          representativeName: this.model.representative.name
        });
      }
    }

    this.docKey = this.model.code;
    this.policyId = this.model.mainMember.policies[0].policyId;
  }

  populateModel(): void {
    const value = this.form.getRawValue();
    if (this.model && this.model.mainMember && value.insurerId) {
      if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
        this.model.mainMember.policies[0].insurerId = value.insurerId;
        if (this.model.mainMember.policies[0].premiumAdjustmentPercentage ==null)  {
          this.model.mainMember.policies[0].premiumAdjustmentPercentage = 0.00;
        }
      }
    }
  }

  getIdNumber(member: RolePlayer): string {
    if (!member.person) { return ''; }
    return member.person.idNumber;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
