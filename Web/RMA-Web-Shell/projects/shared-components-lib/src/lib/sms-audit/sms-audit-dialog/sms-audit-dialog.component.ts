import { Component, Inject } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { SmsAuditComponent } from "../sms-audit.component";
import { SmsAuditService } from "../sms-audit.service";

@Component({
  templateUrl: '../sms-audit.component.html',
  styleUrls: ['../sms-audit.component.css']
})
export class SmsAuditDialogComponent extends SmsAuditComponent {
  
  constructor(
    dialog: MatDialog,
    smsService: SmsAuditService,
    authService: AuthService,
    alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any) 
  {
    super(dialog, smsService, authService, alertService);
    this._itemType = data?.itemType;
    this._itemId = data?.itemId;
    this._rolePlayerContactOptions = data?.rolePlayerContactOptions;
  }
}
