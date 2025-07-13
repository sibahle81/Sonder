import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Brokerage } from 'projects/clientcare/src/app/broker-manager/models/brokerage';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { EmailCommissionStatementRequest } from '../../models/emailCommissionStatementRequest';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-commission-email-broker',
  templateUrl: './commission-email-broker.component.html',
  styleUrls: ['./commission-email-broker.component.css']
})
export class CommissionEmailBrokerComponent implements OnInit {
  isLoading = false;
  emailDataLoading = false;
  emailDataLoaded = false;
  emailSent = false;
  emailSentError = false;
  noEmailsFound = false;
  accountId: number;
  accountTypeId: number;
  periodId: number;
  constructor(
    public dialogRef: MatDialogRef<CommissionEmailBrokerComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly paymentService: PaymentService,
    private readonly brokerageService: BrokerageService
  ) { 
    this.accountId = data.accountId;
    this.accountTypeId = data.accountTypeId;
    this.periodId = data.periodId;
  }

  ngOnInit(): void {

    this.getBrokerage(this.accountId);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getBrokerage(brokerId: number) {
    if (brokerId > 0) {
      this.isLoading = true;
      this.emailDataLoading = true;
      this.brokerageService.getBrokerage(brokerId).subscribe(brokerage => {
        this.emailDataLoading = false;
        this.emailDataLoaded = true;
        this.sendEmail(brokerage);
      });
    }
  }

  sendEmail(brokerage: Brokerage) {
    const emailRequest = new EmailCommissionStatementRequest();
    if (brokerage && brokerage.contacts && brokerage.contacts.length > 0) {
      brokerage.contacts.forEach(contact => {
        if (contact.email) {
          emailRequest.emailAddresses.push(contact.email);
        }
      });
    }
    if (emailRequest.emailAddresses.length > 0) {
      emailRequest.accountId = this.accountId;
      emailRequest.accountTypeId = this.accountTypeId;
      emailRequest.periodId = this.periodId;
      this.paymentService.emailCommissionStatementToBroker(emailRequest).subscribe(result => {
        this.emailDataLoaded = false;
        this.emailSent = true;
      });
    } else {
      this.emailSentError = true;
    }
  }
}
