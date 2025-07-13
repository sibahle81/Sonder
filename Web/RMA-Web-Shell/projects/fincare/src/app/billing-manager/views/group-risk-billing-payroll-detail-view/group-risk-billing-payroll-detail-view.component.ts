import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MatDialog } from '@angular/material/dialog';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import {DebtorSearchResult} from "../../../../../../shared-components-lib/src/lib/models/debtor-search-result";
import {
  DefaultConfirmationDialogComponent
} from "../../../../../../shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component";
import {BenefitPayroll} from "../../../../../../clientcare/src/app/policy-manager/shared/entities/benefit-payroll";
import {ActivatedRoute, Router} from "@angular/router";
import {
  GroupRiskBillingMethodTypeEnum
} from "../../../../../../shared-models-lib/src/lib/enums/group-risk-billing-method-type-enum";
import {
  GroupRiskPolicyCaseService
} from "../../../../../../clientcare/src/app/policy-manager/shared/Services/group-risk-policy-case.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {
  PolicyPremiumRateDetailModel
} from "../../../../../../clientcare/src/app/policy-manager/shared/entities/policy-premium-rate-detail-model";
import {GroupRiskPayrollDetailComponent} from "../group-risk-payroll-detail/group-risk-payroll-detail.component";
import {AppEventsManager} from "../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import {AuthService} from "../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service";
import {DatePipe} from "@angular/common";
import {
  ConfirmationDialogsService
} from "../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service";
import {
  GroupRiskBenefitPayroll
} from "../../../../../../clientcare/src/app/policy-manager/shared/entities/group-risk-benefit-payroll";

@Component({
  selector: 'group-risk-billing-payroll-detail-view',
  templateUrl: './group-risk-billing-payroll-detail-view.component.html',
  styleUrls: ['./group-risk-billing-payroll-detail-view.component.css']
})
export class GroupRiskBillingPayrollDetailViewComponent implements OnInit {

  employerRolePlayerId: number;
  benefitPayrollId: number;
  isLoading: boolean;

  @ViewChild(GroupRiskPayrollDetailComponent, { static: true }) groupPayrollDetailComponent: GroupRiskPayrollDetailComponent;
  //@ViewChild(GroupRiskPremiumRateNotesComponent, { static: true }) groupRiskPremiumRateNotesComponent: GroupRiskPremiumRateNotesComponent;

  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute,
    readonly formBuilder: UntypedFormBuilder,
    readonly alertService: AlertService,
    readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    readonly confirmService: ConfirmationDialogsService,
    readonly datePipe: DatePipe,
    private router: Router

) {

  }

  ngOnInit(): void {

    this.isLoading = true;
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.employerRolePlayerId) {
        this.employerRolePlayerId = params.employerRolePlayerId;
        this.benefitPayrollId = params.benefitPayrollId;

        this.groupRiskPolicyCaseService.getBenefitPayrollById(this.benefitPayrollId)
          .subscribe(benefitPayroll => {
            let groupRiskBenefitPayroll = new GroupRiskBenefitPayroll();
            groupRiskBenefitPayroll.rolePlayerId = this.employerRolePlayerId;
            groupRiskBenefitPayroll.benefitPayrolls = [];
            this.groupPayrollDetailComponent.setViewData(groupRiskBenefitPayroll, false);
            if(benefitPayroll){
              benefitPayroll.rowId =  groupRiskBenefitPayroll.benefitPayrolls.length;
              groupRiskBenefitPayroll.benefitPayrolls.push(benefitPayroll);
              this.groupPayrollDetailComponent.onEdit(benefitPayroll,this.benefitPayrollId );
            }

            this.isLoading = false;
        });

      }
    });
  }

  back(): void {
    this.router.navigate(['/fincare/billing-manager']);
  }

  edit(): void {
    this.router.navigate(['/fincare/billing-manager/groupriskbillingpayrolls/manage-grouprisk-billing/new', this.benefitPayrollId]);
  }

}

