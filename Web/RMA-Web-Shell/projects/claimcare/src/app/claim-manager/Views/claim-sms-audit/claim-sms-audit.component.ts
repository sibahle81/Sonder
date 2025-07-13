import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { SmsAuditService } from 'projects/shared-components-lib/src/lib/sms-audit/sms-audit.service';
import { SmsAuditDialogComponent } from 'projects/shared-components-lib/src/lib/sms-audit/sms-audit-dialog/sms-audit-dialog.component';

@Component({
  selector: 'app-claim-sms-audit',
  templateUrl: '../../../../../../shared-components-lib/src/lib/sms-audit/sms-audit.component.html'
})
export class ClaimSmsAuditComponent extends SmsAuditDialogComponent {

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
