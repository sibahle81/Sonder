import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SlaStatusChangeAuditComponent } from '../sla-status-change-audit.component';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';

@Component({
  templateUrl: './sla-status-change-audit-list-dialog.component.html',
  styleUrls: ['./sla-status-change-audit-list-dialog.component.css']
})
export class SLAStatusChangeAuditListDialogComponent {

  slaItemType: SLAItemTypeEnum;
  currentQuery = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SlaStatusChangeAuditComponent>
  ) {
    if (data) {
      this.slaItemType = data.slaItemType;
      this.currentQuery = data.currentQuery;
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
