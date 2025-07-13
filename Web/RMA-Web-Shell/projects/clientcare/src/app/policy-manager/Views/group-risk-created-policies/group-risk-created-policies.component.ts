import { Commission } from './../../shared/entities/commission';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { ConsolidatedFuneral } from '../../shared/entities/consolidated-funeral';  // remove
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

@Component({
  selector: 'app-group-risk-created-policies',
  templateUrl: './group-risk-created-policies.component.html',
  styleUrls: ['./group-risk-created-policies.component.css']
})
export class GroupRiskCreatedPoliciesComponent extends WizardDetailBaseComponent<GroupRisk> {


  pollingMessage = '';
  errors: string[] = [];
  isLoading = false;

  groupRiskDealTypes : GroupRiskDealTypeEnum [];
  selectedGroupRiskDealTypeId : number;

  productOptionTypes : ProductOption[];
  selectedProductOptionTypeId: any;

  products: Product[];
  selectedProductId : number;

  brokerages : Brokerage[];
  selectedBrokerageId : number;

  commissionTypes :  GroupRiskCommissionTypeEnum[];
  selectedCommissionTypeId : number;

  commissionPaymentProcessTypes : PaymentFrequencyEnum[];
  selectedCommissionPaymentProcessTypeId : number;

  policyHolderTypes : PolicyHolderEnum[];
  selectedPolicyHolderTypeId : number;

  administrators: any[];
  selectedAdministratorId:number;

  rmaRelationshipManagers : any[];
  selectedRmaRelationshipManagerId :number;

  anniversaryMonths: MonthEnum[] ;
  selectedAnniversaryMonthId : number;

  selectedProfitShare: boolean;

  selectedAllowContractor :  boolean;
  selectedFirstYearBrokerCommission :  boolean;
  selectedPartialWaiverActivelyAtWork: boolean;
  selectedPartialWaiverPreExistingCondition : boolean;

  reinsuranceTreatyTypes :GroupRiskReInsuranceTreatyTypeEnum []
  selectedReinsuranceTreatyTypeId : number;

  billingFrequencyTypes : PaymentFrequencyEnum[];
 selectedBillingFrequencyTypeId : number;


 displayedColumns = ['policyName', 'policyNumber', 'policyStartDate', 'policyEndDate','rmaAdministrator' ,'partner','actions'];
// public dataSource = new MatTableDataSource<PostRetirementMedicalAnnuityInvoiceHeader>();  // define colums
public dataSource = new MatTableDataSource<GroupRisk>();
@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
@ViewChild(MatSort, { static: false }) sort: MatSort;
@ViewChild('filter', { static: false }) filter: ElementRef;

  tempdata: InsuredLivesSummaryTable[] = [];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupriskService: GroupRiskService,
    private readonly brokerageService: BrokerageService,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() {

this.groupRiskDealTypes = this.ToKeyValuePair(GroupRiskDealTypeEnum);
this.commissionTypes =  this.ToKeyValuePair(GroupRiskCommissionTypeEnum);
this.commissionPaymentProcessTypes = this.ToKeyValuePair(PaymentFrequencyEnum);
this.policyHolderTypes  = this.ToKeyValuePair(PolicyHolderEnum);
this.reinsuranceTreatyTypes = this.ToKeyValuePair(GroupRiskReInsuranceTreatyTypeEnum);
this.billingFrequencyTypes = this.ToKeyValuePair(PaymentFrequencyEnum);
//To Load
//this.administrators
//this.rmaRelationshipManagers
this.anniversaryMonths = this.ToKeyValuePair(MonthEnum);

  this.getProductOptions();
  this.getProducts();
  this.getBrokerages();
  }

  getProductOptions() {
    this.productOptionService.getProductOptions().subscribe(results => {
      this.productOptionTypes = results;
    });
  }

  getProducts(): void {
    this.productService.getProducts().subscribe(
      results => {
        this.products = results;
      }
    );
  }

  getBrokerages(): void {
    this.brokerageService.getBrokerages().subscribe(
      results => {
        this.brokerages = results;
      }
    );
  }



  createForm() {
    this.form = this.formBuilder.group({
      groupRiskDeal: '',
      productOptionType: '',
      product: '',
      policyNumber: '',
      policyName :'',
      brokerage: '',
      commissionType: '',
      commissionPaymentProcessType :'',
      policyHolderType : '',
      newEffectiveDate: '',
      startDate: '',
      endDate: '',
      administrator: '',
      rmaRelationshipManager :'',
      anniversaryMonth : '',
      profitShare :'',
      schemeStatus: '',
      lastRateUpdateDate :'',
      nextRateReviewDate :'',
      allowContractor :'',
      firstYearBrokerCommission: '',
      commissionDiscount :'',
      partialWaiverActivelyAtWork: '',
      partialWaiverPreExistingCondition: '',
      reinsuranceTreatyType :'',
      billingFrequencyType: '',
      previousInsurer :''

    });
  }

  populateForm() {
      this.errors = [];
      this.isLoading = true;
      this.pollingMessage = 'Loading file data...';
      if (Array.isArray(this.model) && this.model.length > 0) {
        this.model = this.model[0];
      }

      this.form.patchValue({
      //  company: this.model.company,
       // fileIdentifier: this.model.fileIdentifier,
        //date: new Date(this.model.date)
      });
/*
      this.form.disable();
      this.groupriskService.verifyGroupRiskImport(this.model.fileIdentifier).subscribe({
        next: (data) => {
          this.tempdata = [];
          this.createTable(data);
          this.datasource = new MatTableDataSource(this.tempdata);
        },
        error: (response: HttpErrorResponse) => {
          const errorMessage = response.error.Error ? response.error.Error : response.message;
          this.errors.push(errorMessage);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      }); */
  }




//EVENTS

selectPolicyHolderType($event: any){
  if($event){
    console.log($event.value);
    this.selectedPolicyHolderTypeId = $event.value as PolicyHolderEnum;
    // this.hideForm = !this.hideForm;
  }

}



  populateModel() {}

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.errors.length > 0) {
      validationResult.errors = this.errors.length;
      validationResult.errorMessages = this.errors;
    }
    return validationResult;
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums).filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2").replace('_','-') : "N/A";
  }
}
