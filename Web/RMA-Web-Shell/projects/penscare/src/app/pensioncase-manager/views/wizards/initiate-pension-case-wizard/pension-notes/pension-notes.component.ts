import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';
import { FormUtil } from 'projects/shared-utilities-lib/src/lib/form-utility/form-utility';
import { PensCareNote } from 'projects/penscare/src/app/shared-penscare/models/penscare-note';

@Component({
  selector: 'app-pension-notes',
  templateUrl: './pension-notes.component.html',
  styleUrls: ['./pension-notes.component.css']
})
export class PensionNotesComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit {
  dataSource: PensCareNote[];
  viewMode = false;

  displayedColumns = ['title', 'modifiedBy', 'modifiedDate', 'text'];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
  }

  createForm(id: number): void {
  }
  onLoadLookups(): void {
  }
  populateModel(): void {
    this.model.notes = this.dataSource;
  }
  populateForm(): void {
    this.canEdit = !this.isReadonly;
    if (typeof this.model.notes === 'string') {
      this.dataSource = []
    } else if (this.model && this.model.notes) {
      this.dataSource = this.model.notes;
    } else {
      this.dataSource = [];
    }
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  onUpdateNotes(dataSource: PensCareNote[]) {
    this.dataSource = dataSource;
  }

}
