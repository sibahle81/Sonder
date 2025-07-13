import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-audit',
  templateUrl: './payment-audit.component.html'
})
export class PaymentAuditComponent implements OnInit {

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
