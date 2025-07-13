import { Commission } from './../../shared/entities/commission';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { GroupRisk } from '../../shared/entities/group-risk';
import { InsuredLivesSummaryTable, InsuredLivesSummary } from '../../shared/entities/insured-lives-summary';
import { GroupRiskService } from '../../shared/Services/group-risk.service';
import { GroupRiskPolicyCaseModel } from '../../shared/entities/group-risk-policy-case-model';
import { GroupRiskDealTypeEnum } from 'projects/shared-models-lib/src/lib/enums/group-risk-deal-type-enum';
import { BrokerageService } from '../../../broker-manager/services/brokerage.service';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductService } from '../../../product-manager/services/product.service';
import { ProductOption } from '../../../product-manager/models/product-option';
import { Product } from '../../../product-manager/models/product';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { GroupRiskCommissionTypeEnum } from 'projects/shared-models-lib/src/lib/enums/group-risk-commission-type-enum';
import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { PolicyHolderEnum } from 'projects/shared-models-lib/src/lib/enums/policy-holder-enum';
import { MonthEnum } from 'projects/shared-models-lib/src/lib/enums/month.enum';
import { GroupRiskReInsuranceTreatyTypeEnum } from 'projects/shared-models-lib/src/lib/enums/reinsurance-treaty-type-enum';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {GroupRiskPolicyCaseService} from "../../shared/Services/group-risk-policy-case.service";
import {GroupRiskEmployerDetailsComponent} from "../group-risk-employer-details/group-risk-employer-details.component";
import {GroupRiskCreatePoliciesComponent} from "../group-risk-create-policies/group-risk-create-policies.component";
import {
  GroupRiskCreatePolicyBenefitsComponent
} from "../group-risk-create-policy-benefits/group-risk-create-policy-benefits.component";
import {
  GroupRiskCreateBenefitCategoriesComponent
} from "../group-risk-create-benefit-categories/group-risk-create-benefit-categories.component";
import {GroupRiskNotesComponent} from "../group-risk-notes/group-risk-notes.component";
import {GroupRiskDocumentsComponent} from "../group-risk-documents/group-risk-documents.component";

@Component({
  selector: "app-group-risk-policy-view",
  templateUrl: "./group-risk-policy-view.component.html",
  styleUrls: ["./group-risk-policy-view.component.css"],
})
export class GroupRiskPolicyViewComponent implements OnInit {
  pollingMessage = "";
  errors: string[] = [];
  isLoading = false;
  selectedEmployerRolePlayerId: number;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild("filter", { static: false }) filter: ElementRef;

  //wizard components
  @ViewChild(GroupRiskEmployerDetailsComponent, { static: true })
  groupRiskEmployerDetailsComponent: GroupRiskEmployerDetailsComponent;
  @ViewChild(GroupRiskCreatePoliciesComponent, { static: true })
  groupRiskCreatePoliciesComponent: GroupRiskCreatePoliciesComponent;
  @ViewChild(GroupRiskCreatePolicyBenefitsComponent, { static: true })
  groupRiskCreatePolicyBenefitsComponent: GroupRiskCreatePolicyBenefitsComponent;
  @ViewChild(GroupRiskCreateBenefitCategoriesComponent, { static: true })
  groupRiskCreateBenefitCategoriesComponent: GroupRiskCreateBenefitCategoriesComponent;
  @ViewChild(GroupRiskNotesComponent, { static: true })
  groupRiskNotesComponent: GroupRiskNotesComponent;
  @ViewChild(GroupRiskDocumentsComponent, { static: true })
  groupRiskDocumentsComponent: GroupRiskDocumentsComponent;

  constructor(
    authService: AuthService,
    appEventsManager: AppEventsManager,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.selectedEmployerRolePlayerId = params.id;
        this.groupRiskPolicyCaseService
          .getSchemePoliciesByEmployerRolePlayerId(params.id)
          .subscribe((groupRiskPolicyCaseModel) => {
            this.groupRiskEmployerDetailsComponent.setViewData(
              groupRiskPolicyCaseModel,
              false,
            );
            this.groupRiskCreatePoliciesComponent.setViewData(
              groupRiskPolicyCaseModel,
              false,
            );
            this.groupRiskCreatePolicyBenefitsComponent.setViewData(
              groupRiskPolicyCaseModel,
              false,
            );
            this.groupRiskCreateBenefitCategoriesComponent.setViewData(
              groupRiskPolicyCaseModel,
              false,
            );
            this.groupRiskNotesComponent.setViewData(
              groupRiskPolicyCaseModel,
              false,
            );
            this.groupRiskDocumentsComponent.setViewData(
              groupRiskPolicyCaseModel,
              false,
            );
            this.isLoading = false;
          });
      }
    });
  }

  back(): void {
    this.router.navigate(["/clientcare/policy-manager"]);
  }

  edit(): void {
    this.router.navigate([
      "/clientcare/policy-manager/maintain-groupriskpolicy/manage-group-risk-policies/new",
      this.selectedEmployerRolePlayerId,
    ]);
  }
}
