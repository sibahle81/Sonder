import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PensCareNote } from 'projects/penscare/src/app/shared-penscare/models/penscare-note';
import { PensionLedgerStatusNotification } from 'projects/penscare/src/app/shared-penscare/models/pension-ledger-status-notification.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-pension-ledger-status-notes',
  templateUrl: './pension-ledger-status-notes.component.html',
  styleUrls: ['./pension-ledger-status-notes.component.css']
})
export class PensionLedgerStatusNotesComponent extends WizardDetailBaseComponent<PensionLedgerStatusNotification> implements OnInit {
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
