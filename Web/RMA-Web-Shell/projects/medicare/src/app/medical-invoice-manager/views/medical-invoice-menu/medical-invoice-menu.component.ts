import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medical-invoice-menu',
  templateUrl: './medical-invoice-menu.component.html',
  styleUrls: ['./medical-invoice-menu.component.css']
})
export class MedicalInvoiceMenuComponent implements OnInit {

  constructor(
    readonly router: Router
  ) {}

  ngOnInit() {
  }

}
