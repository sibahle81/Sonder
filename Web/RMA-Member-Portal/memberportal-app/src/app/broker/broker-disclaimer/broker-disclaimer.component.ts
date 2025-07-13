import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { BrokerageDialogMessage } from 'src/app/shared/models/brokerage-dialog-message';
import { BrokerageDialogComponent } from '../brokerage-dialog/brokerage-dialog.component';

@Component({
    selector: 'app-broker-disclaimer-list',
    templateUrl: './broker-disclaimer.component.html',
    styleUrls: ['./broker-disclaimer.component.css']
  })

  export class BrokerDisclaimerComponent implements OnInit {

    constructor(
      public readonly dialog: MatDialog,
      private readonly authService: AuthService,
      public readonly lookupService: LookupService,
      public readonly alertService: AlertService,
      public readonly router: Router,
      public datePipe: DatePipe,
    ) {

    }

    ngOnInit(): void {
      this.OpenDisclaimerDialog();
    }

    OpenDisclaimerDialog() {
      const brokerageDialogMessage = new BrokerageDialogMessage();
      brokerageDialogMessage.dialogQuestion = 'I’m an authorized broker on record as per my agreement with RMA and reserve the right to use the broker portal.';
        const dialogRef = this.dialog.open(BrokerageDialogComponent, {
          width: '700px',
          height: 'auto',
          data: { brokerageDialogMessage: brokerageDialogMessage }
        });
    
        dialogRef.afterClosed().subscribe(brokerageDialogMessage => {
          if (brokerageDialogMessage == 'Yes') {
            this.router.navigateByUrl('broker-policy-list');
            return;
          }
          else{
            this.authService.logout();
          }
        });
    }

  }