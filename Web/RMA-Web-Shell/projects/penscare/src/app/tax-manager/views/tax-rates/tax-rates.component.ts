import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/dialog/dialog.component';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ValidatorService } from '../../../services/validator.service';
import { TaxRate } from '../../models/tax-rate.model';
import { TaxRatesNotification } from '../../models/tax-rates-notification.model';
import { PensionTaxService } from '../../services/pension-tax.service';

@Component({
  selector: 'app-tax-rates',
  templateUrl: './tax-rates.component.html',
  styleUrls: ['./../styles/tax-manager.css', './../../../styles/penscare.css']
})
export class TaxRatesComponent implements OnInit {

  displayedColumns = ['taxableIncome', 'ratesOfTax'];
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild('taxYear', { static: true }) taxYear: ElementRef;
  @Output() onSelectedYear = new EventEmitter<any>();
  @Input() inputDataSource;
  @Input() inputSelectedTaxYear;
  addTaxRatesMode = false;

  showSearchProgress = false;
  searchResultsFound = false;
  searchInitiated = false;
  currentQuery = '';
  creatingWizard = false;

  dataSource: TaxRate[] = [];

  searchSubscription: Subscription;
  getTaxRatesSubscription: Subscription;
  validateTaxRateProgress: boolean;
  taxRatesExists = false;
  taxYearInput = '';
  negativeTaxYear: boolean;
  canEdit = false;
  taxRateYearId: number;

  constructor(
    private taxRatesService: PensionTaxService,
    private alertService: AlertService,
    private readonly wizardService: WizardService,
    private readonly router: Router,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private readonly appEventsManager: AppEventsManager,
    public validatorService: ValidatorService,
  ) { }

  ngOnInit(): void {
    this.setPermissions();
  }

  ngAfterViewInit(): void {
    if (this.inputSelectedTaxYear) {
      this.filter.nativeElement.value = this.inputSelectedTaxYear;
      this.currentQuery = this.inputSelectedTaxYear;
      this.dataSource = this.inputDataSource;
      this.searchResultsFound = true;
      this.searchInitiated = true;
      this.cdr.detectChanges();

      this.onSelectedYear.emit({
        searchResultsFound: this.searchResultsFound,
        selectedYear: this.inputSelectedTaxYear,
        dataSource: this.dataSource
      })
    }
    this.searchSubscription = fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => {
              this.currentQuery = this.filter.nativeElement.value;
              this.search();
          })
      )
      .subscribe();

  }

  setPermissions(): void {
    this.canEdit = userUtility.hasPermission('Start Add Tax Rates');
  }

  search() {
    this.currentQuery = this.filter.nativeElement.value;
    if (this.currentQuery == '') return;
    this.showSearchProgress = true;
    this.taxRatesService.getTaxRates(this.currentQuery).subscribe(
      response => {
        this.showSearchProgress = false;
        this.searchInitiated = true;
        if(response && response.length > 0) {
          this.dataSource = response;
          this.taxYearInput = this.currentQuery;
          this.searchResultsFound = true;
          this.taxRateYearId = response[0].taxRateYearId;
        } else {
          this.dataSource = [];
          this.searchResultsFound = false;
        }
        this.onSelectedYear.emit({
          searchResultsFound: this.searchResultsFound,
          selectedYear: this.taxYearInput,
          dataSource: this.dataSource,
          taxRateYearId: this.taxRateYearId
        })
      },
      error => {
        this.showSearchProgress = false;
        this.dataSource = [];
        this.searchResultsFound = false;
        this.alertService.error(error);
        this.onSelectedYear.emit({
          searchResultsFound: this.searchResultsFound,
          selectedYear: this.taxYearInput
        })
      }
    )
  }

  back() {
    this.addTaxRatesMode = false;
  }

  beforeAddTaxRate() {
    this.addTaxRatesMode = true;
  }

  validateTaxRate() {
    this.taxYearInput = this.taxYear.nativeElement.value;
    if (this.taxYearInput == '') return;
    this.negativeTaxYear = false;
    this.taxRatesExists = false;
    if (Number(this.taxYearInput) < 0) {
      this.negativeTaxYear = true;
      return;
    }

    this.validateTaxRateProgress = true;



    this.getTaxRatesSubscription = this.taxRatesService.getTaxRates(this.taxYearInput).subscribe(
      response => {
        this.validateTaxRateProgress = false;
        if(response && response.length > 0) {
          this.taxRatesExists = true;
        } else {
          this.taxRatesExists = false;
          this.manageTaxRate('add', this.taxYearInput)
        }
      },
      error => {
        this.validateTaxRateProgress = false;
        this.dataSource = [];
        this.taxRatesExists = false;
        this.alertService.error(error);
      }
    )
  }


  manageTaxRate(action: string, year: string): void {
    const question = `Are you sure you want to start a new ${action} tax rates wizard?`;
    const hideCloseBtn = true;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { question, hideCloseBtn }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response !== null) {
        this.startWizard(action, year)
      }
    });
  }

  startWizard(action, year) {
    const startWizardRequest = new StartWizardRequest();
    const taxRatesNotification = new TaxRatesNotification();
    taxRatesNotification.taxYear = year;
    taxRatesNotification.action = action;
    taxRatesNotification.taxRates = action === 'add' ? [] : this.dataSource;
    startWizardRequest.data = JSON.stringify(taxRatesNotification);
    startWizardRequest.type = 'tax-rates';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.success(startWizardRequest.type + ' wizard started successfully');
      this.router.navigateByUrl(`/penscare/tax-manager/tax-rates/continue/${result.id}`);
    });
  }



  ngOnDestroy() {
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
    if (this.getTaxRatesSubscription) this.getTaxRatesSubscription.unsubscribe();
  }

}
