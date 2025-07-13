import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { SmsAuditDialogComponent } from 'projects/shared-components-lib/src/lib/sms-audit/sms-audit-dialog/sms-audit-dialog.component';
import { SmsAuditService } from 'projects/shared-components-lib/src/lib/sms-audit/sms-audit.service';

@Component({
  selector: 'person-event-sms-audit',
  templateUrl: '../../../../../../shared-components-lib/src/lib/sms-audit/sms-audit.component.html'
})
export class PersonEventSmsAuditComponent extends SmsAuditDialogComponent {

  constructor(
    dialog: MatDialog,
    authService: AuthService,
    smsService: SmsAuditService,
    alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    super(dialog, smsService, authService, alertService, data);
  }

}
