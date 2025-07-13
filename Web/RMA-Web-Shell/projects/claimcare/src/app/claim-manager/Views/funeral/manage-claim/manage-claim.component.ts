import { Component, OnInit } from '@angular/core';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { ManageClaim } from '../../../shared/entities/funeral/manage-claim.model';

@Component({
  selector: 'app-manage-claim',
  templateUrl: './manage-claim.component.html',
  styleUrls: ['./manage-claim.component.css']
})
export class ManageClaimComponent extends DetailsComponent implements OnInit {

  constructor(
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly router: Router,
    private readonly claimCareService: ClaimCareService,
    readonly formBuilder: UntypedFormBuilder,
  ) {
    super(
      appEventsManager, alertService, router,
      'Manage Claim', 'claimcare/claim-manager/manage-claim', 1
    );
  }
  form: UntypedFormGroup;
  firstName = '';
  lastName = '';
  causeOfDeath: '';
  claimRefNumber = '';
  typeOfDeath: '';
  dateOfDeath: Date;
  dateOfBirth: Date;
  policyNumber: '';
  email = '';
  mobileNumber = '';
  identityNumber = '';
  ngOnInit() {
    this.createForm(1);
    this.claimCareService.getManageClaimDetailsById(1).subscribe((results) => {
      this.populateClaimInfo(results);
    }, err => {

    });
  }

  createForm(id: any) {
    this.form = this.formBuilder.group({
      claimId: '',
      typeOfDeath: new UntypedFormControl('', [Validators.required]),
      causeOfDeath: new UntypedFormControl('', [Validators.required]),
      claimRefNumber: new UntypedFormControl('', [Validators.required]),
      policyNumber: new UntypedFormControl({ value: '', disabled: true }, [Validators.required]),
      dateOfDeath: new UntypedFormControl(''),
      dateOfBirth: new UntypedFormControl(''),
      email: new UntypedFormControl('', [Validators.required, Validators.email]),
      mobileNumber: new UntypedFormControl('', [Validators.required]),
      firstName: new UntypedFormControl(''),
      lastName: new UntypedFormControl(''),
      identityNumber: new UntypedFormControl(''),
    });
  };

  populateClaimInfo(data: ManageClaim) {
    this.form = this.formBuilder.group({
      claimId: data.claimId,
      typeOfDeath: new UntypedFormControl(data.typeOfDeath, [Validators.required]),
      causeOfDeath: new UntypedFormControl(data.causeOfDeath, [Validators.required]),
      claimRefNumber: new UntypedFormControl(data.claimRefNumber, [Validators.required]),
      policyNumber: new UntypedFormControl({ value: data.policyNumber, disabled: true }, [Validators.required]),
      dateOfDeath: new UntypedFormControl(data.dateOfDeath),
      dateOfBirth: new UntypedFormControl(data.dateOfBirth),
      email: new UntypedFormControl(data.email, [Validators.required, Validators.email]),
      mobileNumber: new UntypedFormControl(data.mobileNumber, [Validators.required]),
      firstName: new UntypedFormControl(data.firstName),
      lastName: new UntypedFormControl(data.lastName),
      identityNumber: new UntypedFormControl(data.identityNumber),
    });
  }

  readForm(): void {
    const formModel = this.form.value;

    this.typeOfDeath = formModel.typeOfDeath;
    this.causeOfDeath = formModel.causeOfDeath;
    this.claimRefNumber = formModel.claimRefNumber;
    this.policyNumber = formModel.policyNumber;
    this.dateOfDeath = formModel.dateOfDeath;
    this.dateOfBirth = formModel.dateOfBirth;
    this.email = formModel.email;
    this.mobileNumber = formModel.mobileNumber;
    this.firstName = formModel.firstName;
    this.lastName = formModel.lastName;
    this.identityNumber = formModel.IdentityNumber;

  }

  setForm(item: any): void {
  }

  save(): void {
  }
}
