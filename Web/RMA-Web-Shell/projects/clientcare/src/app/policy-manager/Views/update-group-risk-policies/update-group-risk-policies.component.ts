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
import { Policy } from '../../shared/entities/policy';
import { DefaultConfirmationDialogComponent } from '../../../../../../shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {RolePlayer} from "../../shared/entities/roleplayer";
import {ActivatedRoute, Router} from "@angular/router";
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';

@Component({
  selector: 'update-group-risk-policies',
  templateUrl: './update-group-risk-policies.component.html',
  styleUrls: ['./update-group-risk-policies.component.css']
})
export class UpdateGroupRiskPoliciesComponent implements OnInit {


  form: UntypedFormGroup;
  disabled = false;
  productOptionCode: string = "";
  schemeRolePlayerPayeeId: number = 0;
  selectedRolePlayerName: string = "";
  createNewPolicy = false;
  isLoadingBrokerages = false;
  isLoadingRepresentatives = false;
  errorMessage: string[] = [];
  brokerages: Brokerage[] = [];
  representatives: Representative[] = [];
  selectedPolicy: Policy;
  employerRolePlayer: RolePlayer = new RolePlayer();
  selectedEmployerRolePlayerId: number = 0;
  constructor(
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly policyService: PolicyService,
    private readonly productOptionService: ProductOptionService,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit() {
    this.subscribeUploadChanged();
    this.getLookups();
  }

  getLookups() { }

  subscribeUploadChanged(): void {
  }

  save(): void {
  }

  policySelected(policy: Policy) {
    if (!this.isGroupRiskPolicy(policy)) {
      var dialoqRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          "title": "Maintain Group Risk Policy",
          "text": "You can only select group risk policies to maintain.",
          "showConfirmButton": false
        }
      });
      return;
    }
    this.selectedPolicy = policy;
    this.startWorkflow();
  }
  private startWorkflow() {

  }
  private isGroupRiskPolicy(policy: Policy): boolean {
    return false;
  }


  setRolePlayer($event) {
    this.employerRolePlayer  =  $event;
    this.selectedEmployerRolePlayerId = $event.rolePlayerId;


  }

  viewGroupRiskPolicies() {
    this.router.navigate(['clientcare/policy-manager/groupriskpolicy-details', this.selectedEmployerRolePlayerId]);
  }
}
