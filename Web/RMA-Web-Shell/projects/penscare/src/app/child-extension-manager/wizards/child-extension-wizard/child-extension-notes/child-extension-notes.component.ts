import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChildToAdultPensionLedger } from 'projects/penscare/src/app/shared-penscare/models/child-to-adult-pension-ledger.model';
import { PensCareNote } from 'projects/penscare/src/app/shared-penscare/models/penscare-note';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-child-extension-notes',
  templateUrl: './child-extension-notes.component.html',
  styleUrls: ['./child-extension-notes.component.css']
})
export class ChildExtensionNotesComponent extends WizardDetailBaseComponent<ChildToAdultPensionLedger> implements OnInit {
  childExtensionModel: ChildToAdultPensionLedger;
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
    this.setPermissions();
    if (this.model && this.model.notes) {
      this.dataSource = this.model.notes;
    } else {
      this.dataSource = [];
    }
  }
  setPermissions() {
    this.canEdit = !this.isReadonly;
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  onUpdateNotes(dataSource: PensCareNote[]) {
    this.dataSource = dataSource;
  }

}
