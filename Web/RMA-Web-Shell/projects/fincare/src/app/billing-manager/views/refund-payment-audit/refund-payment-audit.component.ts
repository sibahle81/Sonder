import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-refund-payment-audit',
  templateUrl: './refund-payment-audit.component.html',
  styleUrls: ['./refund-payment-audit.component.css']
})
export class RefundPaymentAuditComponent implements OnInit {

  paymentId: any;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.paymentId = data.Id;
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params.paymentId) {
        this.paymentId = params.paymentId;
      }
    });
  }
}
