import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators } from '@angular/forms';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { PersonDetailsDialogComponent } from '../person-details-dialog/person-details-dialog.component';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

@Component({
  selector: 'role-player-details',
  templateUrl: './role-player-details.component.html',
  styleUrls: ['./role-player-details.component.css']
})
export class RolePlayerDetailsComponent extends WizardDetailBaseComponent<RolePlayer> {

  communicationTypes: Lookup[] = [];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private personDialog: MatDialog
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.lookupService.getCommunicationTypes().subscribe(
      data => this.communicationTypes = data
    );
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      rolePlayerId: [id],
      displayName: ['', [Validators.required]],
      tellNumber: [''],
      cellNumber: [''],
      emailAddress: [''],
      preferredCommunicationTypeId: ['', [Validators.min(1)]],
      isNatural: ['', [Validators.required]]
    });
  }

  populateForm(): void {
    this.form.patchValue({
      rolePlayerId: this.model.rolePlayerId,
      displayName: this.model.displayName,
      tellNumber: this.model.tellNumber,
      cellNumber: this.model.cellNumber,
      emailAddress: this.model.emailAddress,
      preferredCommunicationTypeId: this.model.preferredCommunicationTypeId,
      isNatural: this.model.rolePlayerIdentificationType === RolePlayerIdentificationTypeEnum.Person
    });
  }

  populateModel(): void {
    const value = this.form.value;
    this.model.displayName = value.displayName;
    this.model.tellNumber = value.tellNumber;
    this.model.cellNumber = value.cellNumber;
    this.model.emailAddress = value.emailAddress;
    this.model.preferredCommunicationTypeId = value.preferredCommunicationTypeId;
    this.model.rolePlayerIdentificationType = value.isNatural ? RolePlayerIdentificationTypeEnum.Person : RolePlayerIdentificationTypeEnum.Company;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  showPersonDialog(): void {
    const dialog = this.personDialog.open(PersonDetailsDialogComponent, { data: this.model });
    dialog.afterClosed().subscribe(result => {
      if (result) { this.model.person = result; }
    });
  }
}
