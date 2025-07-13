import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { WizardDetailBaseComponent } from "../../../../../../../shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component";
import { AppEventsManager } from "../../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { AuthService } from "../../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import { GroupRiskPolicyCaseService } from "../../../../policy-manager/shared/Services/group-risk-policy-case.service";

import {
  ConfirmationDialogsService
} from "../../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service";

import {DatePipe} from "@angular/common";
import {
  GroupRiskPremiumRateDetailComponent
} from "../group-risk-premium-rate-detail/group-risk-premium-rate-detail.component";
import {
  GroupRiskPremiumRateNotesComponent
} from "../group-risk-premium-rate-notes/group-risk-premium-rate-notes.component";

@Component({
  selector: "group-risk-premium-rate-detail-view",
  templateUrl: "./group-risk-premium-rate-detail-view.component.html",
  styleUrls: ["./group-risk-premium-rate-detail-view.component.css"],
})
export class GroupRiskPremiumRateDetailViewComponent implements OnInit {


  employerRolePlayerId: number;
  benefitDetailId: number;
  isLoading: boolean;

  @ViewChild(GroupRiskPremiumRateDetailComponent, { static: true }) groupRiskPremiumRateDetailWizardComponent: GroupRiskPremiumRateDetailComponent;
  @ViewChild(GroupRiskPremiumRateNotesComponent, { static: true }) groupRiskPremiumRateNotesComponent: GroupRiskPremiumRateNotesComponent;

  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute,
    readonly formBuilder: UntypedFormBuilder,
    readonly alertService: AlertService,
    readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    readonly confirmService: ConfirmationDialogsService,
    readonly datePipe: DatePipe,
    private router: Router,
  ) {

  }


  ngOnInit(): void {

    this.isLoading = true;
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.employerRolePlayerId = params.id;
        this.benefitDetailId = params.benefitDetailId;
        this.groupRiskPolicyCaseService.getGroupRiskEmployerPremiumRateModel(params.id)
          .subscribe(groupRiskEmployerPremiumRateModel => {
            if(groupRiskEmployerPremiumRateModel !==null){
              let selectedPolicyPremiumRateDetailModel = groupRiskEmployerPremiumRateModel.policyPremiumRateDetailModels.find(x=> x.benefitDetailId ==  this.benefitDetailId);
              this.groupRiskPremiumRateDetailWizardComponent.setViewData(groupRiskEmployerPremiumRateModel, false);
              this.groupRiskPremiumRateDetailWizardComponent.onEdit(selectedPolicyPremiumRateDetailModel,selectedPolicyPremiumRateDetailModel.policyPremiumRateDetailId );
              this.groupRiskPremiumRateNotesComponent.setViewData(groupRiskEmployerPremiumRateModel, false);
            }
            this.isLoading = false;
          });
      }
    });
  }

  back(): void {
    this.router.navigate(['/clientcare/member-manager']);
  }

  edit(): void {
    this.router.navigate(['/clientcare/member-manager/groupriskpremiumrate/manage-grouprisk-premium-rates/new', this.employerRolePlayerId]);
  }

}
