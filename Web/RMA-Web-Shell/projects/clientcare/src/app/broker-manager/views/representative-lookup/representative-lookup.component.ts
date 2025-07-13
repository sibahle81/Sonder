import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidateEmail } from 'projects/shared-utilities-lib/src/lib/validators/email.validator';
import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { RepresentativeService } from '../../services/representative.service';
import { Representative } from '../../models/representative';

@Component({
  templateUrl: './representative-lookup.component.html',
  styleUrls: ['./representative-lookup.component.css']
})
export class RepresentativeLookupComponent extends WizardDetailBaseComponent<Representative>  {

  representative = new Representative();
  representatives: Representative[] = [];
  idTypes: Lookup[] = [];
  detailForm: UntypedFormGroup;
  errors: string[] = [];
  isSearching: boolean;

  get hideSearch(): boolean {
    if (!this.model) { return true; }
    return this.model.id > 0;
  }

  get hasRepresentatives() {
    return this.representatives.length > 0;
  }

  get agentSelected(): boolean {
    if (!this.representative) { return false; }
    return this.representative.id > 0;
  }

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly agentService: RepresentativeService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.loadIdTypes();
  }

  loadIdTypes(): void {
    this.lookupService.getIdTypes().subscribe(
      data => {
        this.idTypes = data;
      }
    );
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      filter: ['', [Validators.required, Validators.minLength(3)]],
      agentId: [0, [Validators.required, Validators.min(1)]],
      contactNumber: ['', [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$'), Validators.minLength(10)]],
      email: ['', [ Validators.email]]
    });
    this.detailForm = this.formBuilder.group({
      name: [''],
      idType: [''],
      idNumber: [''],
      code: [''],
    });
  }

  populateForm(): void {
    if (this.model && this.model.id > 0) {
      this.representative = this.model;
    }
    if (!this.agentSelected) { return; }
    this.form.patchValue({
      filter: this.representative.name,
      agentId: this.representative.id,
      contactNumber: this.representative.contactNumber,
      email: this.representative.email
    });
    this.detailForm.patchValue({
      name: this.representative.name,
      idType: this.representative.idType,
      idNumber: this.representative.idNumber,
      code: this.representative.code,
    });
    this.detailForm.disable();
  }

  populateModel(): void {
    const value = this.form.value;
    this.model = this.representative;
    this.model.contactNumber = value.contactNumber;
    this.model.email = value.email;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  search(event: any): void {
    if (event instanceof KeyboardEvent) {
      if (event.key !== 'Enter') { return; }
    }
    this.isSearching = true;
    this.representatives = [];
    this.representative = new Representative();
    this.form.patchValue({agentId: -1});

    const filter = this.form.get('filter').value;
    if (filter.length < 3) { return; }
    this.errors = [];
    this.agentService.searchRepresentatives(filter).subscribe(data => {
      this.representatives = data;
      if (this.representatives.length > 0) {
        this.form.get('filter').setValidators([]);
        if (this.representatives.length === 1) {
          this.representative = this.representatives[0];
          this.populateForm();
        }
      } else {
        this.errors.push('The agent was not found.');
      }
      this.isSearching = false;
    });
  }

  selectRepresentative(event: any): void {
    const rep = this.representatives.find(r => r.id === event.value);
    if (!rep) { return; }
    this.representative = rep;
    this.populateForm();
  }

  back(event: any): void {
     this.representative.id = 0;
  }
}
