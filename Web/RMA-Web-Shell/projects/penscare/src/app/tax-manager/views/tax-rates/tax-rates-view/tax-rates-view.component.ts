import { Component, OnInit } from '@angular/core';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { TaxRate } from '../../../models/tax-rate.model';

@Component({
  selector: 'app-tax-rates-view',
  templateUrl: './tax-rates-view.component.html',
  styleUrls: ['./tax-rates-view.component.css']
})
export class TaxRatesViewComponent implements OnInit {
  loadedTab = 'taxRates';
  taxResultsFound = false;
  selectedTaxYear = 0;
  notes = [];
  taxDataSource: TaxRate[];
  taxRateYearId: any;
  constructor (
    private pensCareService: PensCareService
  ) { }

  ngOnInit(): void {
  }

  loadTaxRates() {
    this.loadedTab = 'taxRates'
  }

  loadNotes() {
    if (!this.taxResultsFound) {
      this.loadedTab = 'notes';
      return;
    }
    this.loadedTab = 'null';
    this.pensCareService.getNotes(this.taxRateYearId, 'TaxRate').subscribe(response => {
      this.taxResultsFound = true;
      this.notes = response;
      this.loadedTab = 'notes'
    })
  }

  onSelectedYear(data) {
    this.selectedTaxYear = data.selectedYear;
    this.taxResultsFound = data.searchResultsFound;
    this.taxDataSource = data.dataSource;
    this.taxRateYearId = data.taxRateYearId;
  }

  close () {

  }
}
