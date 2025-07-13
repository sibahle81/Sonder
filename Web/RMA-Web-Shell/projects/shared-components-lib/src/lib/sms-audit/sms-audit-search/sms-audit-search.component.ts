import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { SmsAuditService } from '../sms-audit.service';
import { SmsAuditComponent } from '../sms-audit.component';

@Component({
  selector: 'sms-audit-search',
  templateUrl: '../sms-audit.component.html',
  styleUrls: ['../sms-audit.component.css']
})
export class SmsAuditSearchComponent extends SmsAuditComponent implements OnInit {

  @Input() itemType: string;
  @Input() itemId: number;
  @Input() consolidatedView: boolean = false;

  constructor(
    dialog: MatDialog,
    authService: AuthService,
    smsService: SmsAuditService,
    alertService: AlertService
  ) {
    super(dialog, smsService, authService, alertService);
  }

  ngOnInit() {
    this.showCloseButton = false;
    this._itemType = this.itemType;
    this._itemId = this.itemId; 
    this._consolidatedView = this.consolidatedView;    
    super.ngOnInit();
  }

}
