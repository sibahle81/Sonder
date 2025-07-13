import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { EmailNotificationAuditComponent } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.component';
import { EmailNotificationAuditComponentDataSource } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.datasource';
import { EmailNotificationAuditService } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-person-event-email-audit',
  templateUrl: '../../../../../../shared-components-lib/src/lib/email-notification-audit/email-notification-audit.component.html'
})
export class PersonEventEmailAuditComponent extends EmailNotificationAuditComponent {

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
    super(router, formBuilder, dataSource, dialog, alertService, activatedRoute, authService, emailService, data, toastr);
  }
}

