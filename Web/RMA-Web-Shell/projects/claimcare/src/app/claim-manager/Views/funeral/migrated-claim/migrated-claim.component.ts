import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { InsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/insured-life';
import { InsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/insured-life.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { RegisterFuneralModel } from '../../../shared/entities/funeral/register-funeral.model';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';

@Component({
  selector: 'app-migrated-claim',
  templateUrl: './migrated-claim.component.html',
})
export class MigratedClaimComponent extends DetailsComponent implements OnInit {

  policyId: number;
  claimId: number;
  policy: Policy;
  insuredLifeId: number;
  insuredLife: InsuredLife;
  insuredLives: InsuredLife[];
  registerFuneralDetails: RegisterFuneralModel;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly policyService: PolicyService,
    private readonly insuredLifeService: InsuredLifeService,
    private readonly claimService: ClaimCareService) {
    super(appEventsManager, alertService, router, 'Migrated claim', 'claimcare/claim-manager/search', 1);
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params: any) => {
        this.policyId = params.policyId;
        this.insuredLifeId = params.insuredLifeId;
        this.claimId = params.claimId;

        this.createForm();
        this.getPolicy();
        this.getNotes(this.claimId, ServiceTypeEnum.ClaimManager, 'Claim');
    });

  }

  createForm() {
    this.form = this.formBuilder.group({
      id: this.policyId,
      typeOfDeath: new UntypedFormControl({ value: '', disabled: true }),
      deceased: new UntypedFormControl({ value: '', disabled: true }),
      policyNumber: new UntypedFormControl({ value: '', disabled: true }),
      dateOfDeath: new UntypedFormControl({ value: '', disabled: true }),
      firstName: new UntypedFormControl({ value: '', disabled: true }),
      lastName: new UntypedFormControl({ value: '', disabled: true }),
    });
  }

  setForm() {
    this.form.patchValue({
      policyNumber: this.policy.policyNumber,
      deceased: this.insuredLives,
      firstName: this.insuredLife.name,
      lastName: this.insuredLife.surname,
      dateOfDeath: this.registerFuneralDetails.dateOfDeath,
      typeOfDeath: this.registerFuneralDetails.deathType,
    });

    this.form.patchValue({
      deceased: this.insuredLife.id
    });
  }

  readForm() { }

  save() { }

  cancel() {
    this.router.navigateByUrl('claimcare/claim-manager/search');
  }

  getPolicy() {
    this.policyService.getPolicy(this.policyId).subscribe(policy => {
      this.policy = policy;
      this.insuredLifeService.getInsuredLivesByPolicy(this.policyId).subscribe(insuredLives => {
        this.insuredLives = insuredLives;
        this.insuredLife = this.insuredLives.find(s => s.id === this.insuredLifeId);
        this.claimService.GetMigtratedClaimDetails(this.claimId).subscribe(result => {
          this.registerFuneralDetails = result;
          this.setForm();
        });
      });
    });
  }
}
