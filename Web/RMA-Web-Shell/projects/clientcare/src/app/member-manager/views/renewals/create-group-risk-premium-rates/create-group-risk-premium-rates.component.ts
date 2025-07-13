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
import {DialogComponent} from "../../../../../../../shared-components-lib/src/lib/dialogs/dialog/dialog.component";
import {
  AppEventsManager
} from "../../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import {
  GroupRiskEmployerPremiumRateModel
} from "../../../../policy-manager/shared/entities/group-risk-employer-premium-rate--model";
import {Router} from "@angular/router";
import {MatTableDataSource} from "@angular/material/table";
import {
  PolicyPremiumRateDetailModel
} from "../../../../policy-manager/shared/entities/policy-premium-rate-detail-model";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {GroupRiskPolicyCaseService} from "../../../../policy-manager/shared/Services/group-risk-policy-case.service";
import {
  GroupRiskBillingMethodTypeEnum
} from "../../../../../../../shared-models-lib/src/lib/enums/group-risk-billing-method-type-enum";

@Component({
  selector: 'create-group-risk-premium-rates',
  templateUrl: './create-group-risk-premium-rates.component.html',
  styleUrls: ['./create-group-risk-premium-rates.component.css']
})
export class CreateGroupRiskPremiumRatesComponent implements OnInit, OnChanges {
  @Input() rolePlayers: RolePlayer[];
  @Input() isWizard: boolean;
  @Input() isReadOnly: boolean;

  companyRolePlayer: RolePlayer;

  form: UntypedFormGroup;
  industryClasses: any[] = [];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedCompanyRolePlayerId: number;
  groupRiskEmployerPremiumRateModel : GroupRiskEmployerPremiumRateModel;
  displayedColumns = [
    "policyName",
    "benefitName",
    "benefitCategoryName",
    "billingMethodName",
    "totalRate",
    "effectiveDate",
    "lastUpdateDate",
    "actions",
  ]
  public dataSource = new MatTableDataSource<PolicyPremiumRateDetailModel>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  isLoadingGroupRiskPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(
    true,
  );
  policyPremiumRateDetailModelTableData: PolicyPremiumRateDetailModel[];
  currentQuery: string = '';
  constructor(
     readonly formBuilder: UntypedFormBuilder,
     readonly alertService: AlertService,
     readonly wizardService: WizardService,
     readonly dialog: MatDialog,
     readonly appEventsManager: AppEventsManager,
     readonly router: Router,
     readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService) { }

  ngOnInit(): void {
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
  }

  getLookups() {
    this.loadBillingMethodTypes();
    this.createForm();
    this.loadData();
    this.isLoading$.next(false);
  }

  billingMethodTypes: string[];

  loadBillingMethodTypes() {
    this.billingMethodTypes = Object.keys(GroupRiskBillingMethodTypeEnum);
  }

  getBillingMethodName(billingMethodCode: string):string {

    let billingMethodName =  this.billingMethodTypes.find(x=> x.startsWith(billingMethodCode));
    if(!billingMethodName){
      billingMethodName =  this.billingMethodTypes.find(x=> x.startsWith('AmountPerMember'));
    }
    return  billingMethodName;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  createForm() {

  }

  setCompanyRolePlayer({$event}: { $event: any }) {
    this.companyRolePlayer = $event;
    this.selectedCompanyRolePlayerId = $event.rolePlayerId;
    this.groupRiskEmployerPremiumRateModel = new GroupRiskEmployerPremiumRateModel();
    this.groupRiskEmployerPremiumRateModel.employerRolePlayerId = $event.rolePlayerId;
     this.loadData();
  }

  bindPolicyRateTable() {
    this.dataSource.data = this.policyPremiumRateDetailModelTableData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addPremiumRate(): void {

    if(!this.companyRolePlayer){
      this.alertService.error('Please select company before adding premium rate');
      return;
    }

    const question = `Are you sure you want to start a new premium rate wizard for [${this.companyRolePlayer.displayName} - ${this.companyRolePlayer.finPayee.finPayeNumber}]?`;
    const hideCloseBtn = true;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { question, hideCloseBtn }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response !== null) {
        this.appEventsManager.loadingStart('Please wait..');
        this.startWizard();
      }
    });
  }

  startWizard() {
    this.isLoading$.next(true);
    const request = new StartWizardRequest();
    request.linkedItemId = -1;
    request.data = JSON.stringify(this.groupRiskEmployerPremiumRateModel);
    request.type = 'manage-grouprisk-premium-rates';

    this.wizardService.startWizard(request).subscribe(result => {
      let wizardId = result.id;
      this.alertService.success('Wizard created successfully');
      this.router.navigateByUrl(`clientcare/member-manager/manage-grouprisk-premium-rates/continue/${wizardId}`);
    });
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  search() {
    this.currentQuery = this.filter.nativeElement.value;
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  loadData(): void {

    if (this.selectedCompanyRolePlayerId && this.selectedCompanyRolePlayerId > 0) {
      this.isLoadingGroupRiskPolicies$.next(true);
      this.groupRiskPolicyCaseService
        .getEmployerPolicyPremiumRateDetail(this.selectedCompanyRolePlayerId, this.currentQuery )
        .subscribe((results) => {
          this.policyPremiumRateDetailModelTableData = results;
          this.bindPolicyRateTable();
          this.isLoadingGroupRiskPolicies$.next(false);
        });
    }
  }

  //route to the premium rate component
  onViewPremiumRate(row, i) {
    let   policyPremiumRateDetailModel  = row as PolicyPremiumRateDetailModel;
    let  benefitDetailId = policyPremiumRateDetailModel.benefitDetailId;
    this.router.navigate([`/clientcare/member-manager/groupriskpremiumrate-details/${this.selectedCompanyRolePlayerId}/${benefitDetailId}`]);

  }

}
