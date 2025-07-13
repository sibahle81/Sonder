import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { Router } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { Policy } from '../../shared/entities/policy';

@Component({
  selector: 'app-reinstate-policy-data-migration',
  templateUrl: './reinstate-policy-data-migration.component.html',
  styleUrls: ['./reinstate-policy-data-migration.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class ReinstatePolicyDataMigrationComponent implements OnInit {

  form: UntypedFormGroup;
  policy: Policy;
  isLoading: boolean;
  hasPermission: boolean; // Allow Reinstate

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly policyService: PolicyService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) { }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission('Allow Reinstate');
    this.createForm(0);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      policyNumber: ['', [Validators.required]],
      lastLapsedDate: ['', [Validators.required]],
      reinstateDate: ['']
    });
  }

  readForm(): Policy {
    const formModel = this.form.getRawValue();
    const policy = new Policy();

    policy.policyNumber = formModel.policyNumber;
    policy.lastLapsedDate = formModel.lastLapsedDate;
    policy.lastReinstateDate = formModel.reinstateDate;

    return policy;
  }

  getPolicy() {
    this.isLoading = true;
    const policy = this.readForm();
    this.policyService.getNewPolicyByNumber(policy.policyNumber).subscribe(result => {
      if (result && (result.policyStatus === PolicyStatusEnum.Active || result.policyStatus === PolicyStatusEnum.Lapsed)) {
        this.policy = result;

        this.policy.lastReinstateDate = policy.lastReinstateDate;
        this.policy.lastLapsedDate = policy.lastLapsedDate;

        if (!this.policy.lastReinstateDate) {
          this.policy.policyStatus = PolicyStatusEnum.Lapsed;
        } else {
          this.policy.policyStatus = PolicyStatusEnum.Active;
        }

        if (this.policy.lapsedCount === null) {
          this.policy.lapsedCount = 0;
        }

        this.policy.lapsedCount++;

        if (this.policy.lapsedCount > 2) {
          this.isLoading = false;
          this.alertService.error(`${this.policy.policyNumber} can not be reinstated more then once`);
        } else {
          this.updatePolicy();
        }
      } else {
        this.isLoading = false;
        this.alertService.error('Policies must be active/lapsed before being reinstated');
      }
      this.clear();
    });

    this.alertService.getMessage().subscribe(message => {
      if (message.title === 'Error') {
        this.clear();
      }
    });
  }

  clear() {
    this.isLoading = false;
    this.form.patchValue({
      policyNumber: '',
      lastLapsedDate: null,
      reinstateDate: null
    });
  }

  updatePolicy() {
    this.policyService.editPolicy(this.policy).subscribe(result => {
      if (result) {
        if (this.policy.lastLapsedDate && this.policy.lastReinstateDate) {
          this.alertService.success(`${this.policy.policyNumber} has been reinstated successfully`);
        } else {
          this.alertService.success(`${this.policy.policyNumber} has been lapsed successfully`);
        }
      }
    });
  }

  submit() {
    if (!this.form.valid) { return; }
    this.getPolicy();
  }

  back() {
    this.router.navigateByUrl('clientcare/policy-manager');
  }
}
