import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { SmsAuditComponent } from 'src/app/shared/components/sms-audit/sms-audit.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { SmsAuditService } from 'src/app/shared/services/sms-audit.service';

@Component({
  selector: 'app-broker-policy-sms-audit',
  template: '<app-sms-audit></app-sms-audit>'
})
export class BrokerPolicySmsAuditComponent extends SmsAuditComponent {

  constructor(
    smsService: SmsAuditService,
    authService: AuthService,
    alertService: AlertService,
    @Inject(MAT_DIALOG_DATA)  data: any
 ) {
   super(smsService, authService, alertService, data);
 }

}
