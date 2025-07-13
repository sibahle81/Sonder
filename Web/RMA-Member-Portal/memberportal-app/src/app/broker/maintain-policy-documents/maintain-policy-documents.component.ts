import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CreateCaseDocumentsComponent } from 'src/app/case/create-case-documents/create-case-documents.component';
import { UserDetails } from 'src/app/core/models/security/user-details.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { DocumentStatusEnum } from 'src/app/shared/enums/document-status.enum';
import { Brokerage } from 'src/app/shared/models/brokerage';
import { Case } from 'src/app/shared/models/case';
import { Product } from 'src/app/shared/models/product';
import { Representative } from 'src/app/shared/models/representative';
import { RolePlayerPolicy } from 'src/app/shared/models/role-player-policy';
import { StartWizardRequest } from 'src/app/shared/models/start-wizard-request.model';
import { AlertService } from 'src/app/shared/services/alert.service';
import { RequiredDocumentService } from 'src/app/shared/services/required-document.service';
import { WizardService } from 'src/app/shared/services/wizard.service';
import { BrokerPolicyListComponent } from '../broker-policy-list/broker-policy-list.component';
import { BrokerPolicyService } from '../services/broker-policy-service';

@Component({
  selector: 'app-maintain-policy-documents',
  templateUrl: './maintain-policy-documents.component.html',
  styleUrls: ['./maintain-policy-documents.component.scss']
})
export class MaintainPolicyDocumentsComponent implements OnInit {

  @ViewChild(CreateCaseDocumentsComponent) createCaseDocumentsComponent: CreateCaseDocumentsComponent;

  form: any;
  policyNumber: string;
  user: UserDetails;
  case = new Case();
  brokerage: Brokerage;
  rolePlayerPolicy: RolePlayerPolicy;
  brokerages: Brokerage[] = [];
  activeProducts: Product[] = [];
  representative: Representative;
  juristicRepresentativeId: number;
  juristicRepresentative: Representative;

  generatedCode = '';
  selectedBrokerId = 0;
  isGroup = false;
  hasBroker = false;
  requiredDoc = false;
  isGroupPolicy = false;
  documentsRequired = true;
  documentSetLoading = true;
  allDocumentsSupplied = false;
  hasCreateCasePermission = false;

  hasGroupPermission: boolean;
  hasIndividualPermission: boolean;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);


  constructor(public dialogRef: MatDialogRef<BrokerPolicyListComponent>,
    @Inject(MAT_DIALOG_DATA) data: string,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly authService: AuthService,
    private readonly brokerPolicyService: BrokerPolicyService,
    private readonly privateRouter: Router,
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly wizardService: WizardService) {
    this.policyNumber = data as string;
    this.createForm();
  }

  ngOnInit(): void {
    this.configurePermissions();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      code: new FormControl('')
    })
    this.form.get('code').disable();
    this.findPolicy(this.policyNumber);
  }

  findPolicy(policyNumber: string) {
    this.brokerPolicyService.searchPoliciesForCase(policyNumber).subscribe(data => {
      if (data) {
        this.rolePlayerPolicy = data[0];
        this.isGroupPolicy = this.rolePlayerPolicy.isGroupPolicy;
        this.generateCaseCode();
      }
    });
  }

  configurePermissions() {
    this.user = this.authService.getCurrentUser();
    if (this.user.roleName === ConstantPlaceholder.MemberPortalBrokerRole) {
      this.hasCreateCasePermission = true;
      this.hasIndividualPermission = true;
      this.hasGroupPermission = true;
    }
  }

  setForm() {
    this.form.patchValue({
      code: this.generatedCode
    });
  }

  checkDocuments(): void {
    const awaitingDocuments = this.createCaseDocumentsComponent.documents.filter(
      s => s.documentStatus === DocumentStatusEnum.Awaiting && s.required);
    this.allDocumentsSupplied = awaitingDocuments.length === 0;
  }

  generateCaseCode() {
    this.requiredDocumentService.generateDocumentNumber('PolicyCase').subscribe(result => {
      this.generatedCode = result;
      this.case.code = this.generatedCode;
      if (this.createCaseDocumentsComponent) {
        this.createCaseDocumentsComponent.keys = { CaseCode: `${this.generatedCode}` };
      }
      this.setForm();
      this.caseTypeChanged();
      this.documentSetLoading = false;
    });
  }

  back(): void {
    this.privateRouter.navigate(['']);
  }

  close() {
    this.dialogRef.close(null);
  }

  caseTypeChanged() {
    if (this.isGroupPolicy) {
      this.isGroup = true;
      this.requiredDoc = true;
      this.allDocumentsSupplied = true;
    } else {
      this.isGroup = false;
      this.requiredDoc = false;
      this.allDocumentsSupplied = false;
    }

    this.documentSetLoading = true;
    if (this.documentsRequired) {
      this.createCaseDocumentsComponent.refresh(3);

    }
    this.CheckDocumentStatus();
    this.documentSetLoading = false;
  }

  navigateToWorkflow() {
    this.isLoading$.next(true);
    if (this.documentsRequired) {
      const awaitingDocuments = this.createCaseDocumentsComponent.documents.filter(
        s => s.documentStatus === DocumentStatusEnum.Awaiting && s.required);
      this.allDocumentsSupplied = awaitingDocuments.length === 0;
      if (!this.allDocumentsSupplied) { return; }
    }
    this.startWizard();
  }


  CheckDocumentStatus() {
    this.createCaseDocumentsComponent.allDocumentsSupplied$.subscribe(result => {
      if (this.createCaseDocumentsComponent.documents) {
        this.createCaseDocumentsComponent.documents.forEach(doc => {
          if (doc.documentStatus === DocumentStatusEnum.Received && doc.documentTypeName === ConstantPlaceholder.SignedPolicyAmendmentForm) {
            this.allDocumentsSupplied = true;
          }
        })
      }
    })
  }

  startWizard() {
    const startWizardRequest = new StartWizardRequest();
    let wizardRequestType: string;

    if (this.isGroupPolicy) {
      wizardRequestType = 'manage-policy-group';
    } else {
      wizardRequestType = 'manage-policy-individual';
    }

    this.instantiateExistingPolicyCaseVaribles(startWizardRequest, this.rolePlayerPolicy.policyId);
    startWizardRequest.type = wizardRequestType;
    this.doSubmit(startWizardRequest);
  }

  instantiateExistingPolicyCaseVaribles(startWizardRequest: StartWizardRequest, policyId: number) {
    this.case = new Case();
    this.case.code = this.generatedCode;
    this.case.caseTypeId = 3;
    startWizardRequest.linkedItemId = policyId;
    startWizardRequest.data = JSON.stringify(this.case);
  }

  doSubmit(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      this.alertService.success('Case created successfully');
      this.dialogRef.close(null);
      this.privateRouter.navigateByUrl('case-list');
      this.isLoading$.next(false);
    });
  }
}
