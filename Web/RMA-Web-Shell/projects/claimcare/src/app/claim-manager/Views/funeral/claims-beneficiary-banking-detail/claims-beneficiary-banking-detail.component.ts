import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BeneficiaryBankingDetailComponent } from 'projects/shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-banking-detail.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UntypedFormBuilder } from '@angular/forms';
import { BankAccountService } from 'projects/clientcare/src/app/client-manager/shared/services/bank-account.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BeneficiaryBankAccountRequest } from 'projects/shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-Bank-Account-request';
import { BeneficiaryBankingDetailDataSource } from 'projects/shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-banking-detail.datasource';
import { BeneficiaryBankingDetailService } from 'projects/shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-banking-detail.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';

@Component({
  selector: 'app-claims-document',
  templateUrl: '../../../../../../../shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-banking-detail.component.html'
})

export class ClaimsBeneficiaryBankingDetailComponent extends BeneficiaryBankingDetailComponent implements OnInit {

  system = ServiceTypeEnum[ServiceTypeEnum.ClaimManager];
  workpool = WorkPoolEnum[WorkPoolEnum.FuneralClaims];
  path: string;

  constructor(
    router: Router,
    formBuilder: UntypedFormBuilder,
    alertService: AlertService,
    lookUpService: LookupService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    claimCareService: ClaimCareService,
    public activatedroute: ActivatedRoute,
    bankAccountService: BankAccountService,
    dateAdapter: DateAdapter<NativeDateAdapter>,
    dataSource: BeneficiaryBankingDetailDataSource,
    BenBankingDetailService: BeneficiaryBankingDetailService) {
    super(router, formBuilder, dateAdapter, alertService, lookUpService, activatedRoute, claimCareService
      , appEventsManager, dataSource, bankAccountService, BenBankingDetailService);
    this.path = this.router.url;
  }

  ngOnInit() {
    this.activatedroute.params.subscribe(params => {
      const request = new BeneficiaryBankAccountRequest();
      request.workPool = this.workpool;
      request.system = this.system;
      request.policyId = params.id;
      request.wizardId = params.wizardId;
      request.reasonAdd = 'Added by claims';
      request.reasonUpdate = 'Updated by claims';
      this.setSystem(request);
      super.ngOnInit();
    });
  }
}

