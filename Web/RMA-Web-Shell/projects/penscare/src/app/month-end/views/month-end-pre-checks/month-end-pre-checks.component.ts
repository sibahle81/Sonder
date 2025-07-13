import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-month-end-pre-checks',
  templateUrl: './month-end-pre-checks.component.html',
  styleUrls: ['./month-end-pre-checks.component.css']
})
export class MonthEndPreChecksComponent implements OnInit {
  public viewInvalidBankingDetails = false;

  constructor(
  ) { }

  ngOnInit(): void {
  }

  onViewInvalidBankngDetails() {
    this.viewInvalidBankingDetails = true;
  }
}
