import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';

import { GroupRiskService } from '../../shared/Services/group-risk.service';
import { PolicyService } from '../../shared/Services/policy.service';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { BrokerageService } from '../../../broker-manager/services/brokerage.service';
import { RepresentativeService } from '../../../broker-manager/services/representative.service';
import { Representative } from '../../../broker-manager/models/representative';

import * as XLSX from 'xlsx';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductOption } from '../../../product-manager/models/product-option';
import { Router } from '@angular/router';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { GroupRiskPolicyCaseModel } from '../../shared/entities/group-risk-policy-case-model';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { Person } from '../../shared/entities/person';
import { Company } from '../../shared/entities/company';

@Component({
  selector: 'app-create-group-risk-policies',
  templateUrl: './create-group-risk-policies.component.html',
  styleUrls: ['./create-group-risk-policies.component.css']
})
export class CreateGroupRiskPoliciesComponent implements OnInit {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  form: UntypedFormGroup;
  disabled = false;
  productOptionCode: string = "";
  schemeRolePlayerPayeeId: number = 0;
  selectedRolePlayerName: string = "";
  generatedCode = '';
  createNewPolicy = false;
  isLoadingBrokerages = false;
  isLoadingRepresentatives = false;
  errorMessage: string[] = [];
  brokerages: Brokerage[] = [];
  representatives: Representative[] = [];
   groupRiskPolicyCase:  GroupRiskPolicyCaseModel;

  constructor(
    private readonly alertService: AlertService,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly wizardService: WizardService,
    private readonly router: Router
  ) { }

  ngOnInit() {
    this.subscribeUploadChanged();
    this.getLookups();
    this.groupRiskPolicyCase  = new GroupRiskPolicyCaseModel();
    this.generateCaseCode();
  }

  getLookups() { }

  subscribeUploadChanged(): void {
    this.uploadControlComponent.uploadChanged.subscribe(data => {
      if (data) {
        this.errorMessage = [];
        this.disabled = false;
      }
    });
  }

  setRolePlayer($event) {
    this.productOptionCode = '';
    this.schemeRolePlayerPayeeId = $event.rolePlayerId;
    this.selectedRolePlayerName = ` (${$event.finPayee.finPayeNumber}) ${$event.displayName}`;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2').replace('_', '-');
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  navigateTo(): void {
    this.startWizard();
  }

  startWizard() {
    const startWizardRequest = new StartWizardRequest();
    let wizardRequestType: string;
    wizardRequestType = 'manage-group-risk-policies';
    this.instantiateCaseVariables(startWizardRequest);
    startWizardRequest.linkedItemId = 452545;
    startWizardRequest.type = wizardRequestType;
    this.doSubmit(startWizardRequest);
  }

  doSubmit(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      this.alertService.success('Case created successfully');
      this.router.navigateByUrl('clientcare/policy-manager');
    });
  }

  instantiateCaseVariables(startWizardRequest: StartWizardRequest) {
    const s = JSON.stringify(this.groupRiskPolicyCase);
    startWizardRequest.data = s;
  }

  generateCaseCode() {
    this.requiredDocumentService.generateDocumentNumber('PolicyCase').subscribe(result => {
      this.generatedCode = result;
      this.groupRiskPolicyCase.code = this.generatedCode;

    });
  }
}
