import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { EmailAuditComponent } from 'src/app/shared/components/email-audit/email-audit.component';
import { EmailNotificationAuditComponentDataSource } from 'src/app/shared/components/email-audit/email-audit.datasource';
import { AlertService } from 'src/app/shared/services/alert.service';
import { EmailAuditService } from 'src/app/shared/services/email-audit.service';

@Component({
  selector: 'app-broker-policy-email-audit',
  template: '<app-email-audit></app-email-audit>'
})
export class BrokerPolicyEmailAuditComponent extends EmailAuditComponent {

  constructor(
    emailService: EmailAuditService,
    authService: AuthService,
    alertService: AlertService,
    @Inject(MAT_DIALOG_DATA)  data: any
 ) {
   super(emailService, authService, alertService, data);
 }

}
