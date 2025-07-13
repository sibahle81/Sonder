import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { Person } from '../../shared/entities/person';
import { Case } from '../../shared/entities/case';

@Component({
  selector: 'app-main-member-person',
  templateUrl: './main-member-person.component.html',
  styleUrls: ['./main-member-person.component.css']
})
export class MainMemberPersonComponent extends WizardDetailBaseComponent<Case> {

  idTypes: Lookup[] = [];

  get isAlive(): boolean {
    return this.form.get('isAlive').value;
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.lookupService.getIdTypes().subscribe(
      data => {
        this.idTypes = data;
      }
    );
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      rolePlayerId: new UntypedFormControl(),
      idType: new UntypedFormControl({ value: '', disabled: true }),
      idNumber: new UntypedFormControl({ value: '', disabled: true }),
      firstName: new UntypedFormControl({ value: '', disabled: true }),
      surname: new UntypedFormControl({ value: '', disabled: true }),
      dateOfBirth: new UntypedFormControl({ value: '', disabled: true }),
      age: new UntypedFormControl({ value: '', disabled: true }),
      isAlive: new UntypedFormControl({ value: '', disabled: true }),
      dateOfDeath: new UntypedFormControl({ value: '', disabled: true }),
      deathCertificateNumber: new UntypedFormControl({ value: '', disabled: true }),
      vopdVerifyDate: new UntypedFormControl({ value: '', disabled: true }),
      vopdVerified: new UntypedFormControl({ value: '', disabled: true })
    });
  }

  populateForm(): void {
    const member = this.model.mainMember;
    const person = this.model.mainMember.person ? this.model.mainMember.person : new Person();
    this.form.patchValue({
      rolePlayerId: member.rolePlayerId,
      idType: person.idType,
      idNumber: person.idNumber,
      firstName: person.firstName,
      surname: person.surname,
      dateOfBirth: person.dateOfBirth,
      age: this.calculateAge(person.dateOfBirth),
      isAlive: person.isAlive,
      dateOfDeath: person.dateOfDeath,
      deathCertificateNumber: person.deathCertificateNumber,
      vopdVerifyDate: person.dateVopdVerified,
      vopdVerified: person.isVopdVerified
    });
  }

  calculateAge(dateOfBirth: any): number {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    let years = today.getFullYear() - dob.getFullYear();
    const birthDay = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthDay > today) { years--; }
    return years;
  }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

}
