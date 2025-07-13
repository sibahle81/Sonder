import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { EmailNotificationAuditComponent } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.component';
import { EmailNotificationAuditComponentDataSource } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.datasource';
import { EmailNotificationAuditService } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.service';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-claim-notification-audit',
  templateUrl: '../../../../../../shared-components-lib/src/lib/email-notification-audit/email-notification-audit.component.html'
})
export class ClaimNotificationAuditComponent extends EmailNotificationAuditComponent {

  constructor(
    router: Router,
    formBuilder: UntypedFormBuilder,
    dataSource: EmailNotificationAuditComponentDataSource,
    dialog: MatDialog,
    alertService: AlertService,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    emailService: EmailNotificationAuditService,
    @Inject(MAT_DIALOG_DATA) data: any,
    toastr: ToastrManager
  ) {
    super(router, formBuilder, dataSource, dialog, alertService, activatedRoute, authService, emailService, data,toastr);
  }
}
