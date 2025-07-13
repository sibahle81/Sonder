import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/dialog/dialog.component';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { Subscription } from 'rxjs';
import { TaxRebate } from '../../models/tax-rebate.model';
import { TaxRebatesNotification } from '../../models/tax-rebates-notification.model';
import 'src/app/shared/extensions/string.extensions';
import { ValidatorService } from '../../../services/validator.service';
import { PensionTaxService } from '../../services/pension-tax.service';

@Component({
  selector: 'app-tax-rebates',
  templateUrl: './tax-rebates.component.html',
  styleUrls: ['./../styles/tax-manager.css']
})
export class TaxRebatesComponent implements OnInit {
  showSearchProgress = true;
  addTaxRebatesMode = false;
  taxRebatesExists = false;
  @ViewChild('taxYear', { static: true }) taxYear: ElementRef;
  getTaxRebatesSubscription: Subscription;
  displayedColumns = ['year','primary', 'secondary', 'tertiary', 'actions'];
  menus: { title: string, action: string, disable: boolean }[];
  canEdit = true;

  dataSource: TaxRebate[] = [];
  taxYearInput = '';
  validateTaxRebatesProgress: boolean;
  getTaxRebatesByYearSubscription: Subscription;
  negativeTaxYear: boolean;
  creatingWizard = false;

  constructor(
    private taxRebatesService: PensionTaxService,
    private alertService: AlertService,
    private readonly wizardService: WizardService,
    private readonly router: Router,
    public dialog: MatDialog,
    private readonly appEventsManager: AppEventsManager,
    public validatorService: ValidatorService,
  ) { }

  ngOnInit(): void {
    this.setPermissions();
    this.menus =
    [
      { title: 'Edit', action: 'edit', disable: !this.canEdit }
    ];

    this.displayedColumns = this.canEdit ?
      ['year','primary', 'secondary', 'tertiary', 'actions'] :
      ['year','primary', 'secondary', 'tertiary']
  }

  ngAfterViewInit(): void {
    this.search();
  }

  beforeAddTaxRate() {
    this.addTaxRebatesMode = true;
  }

  back() {
    this.addTaxRebatesMode = false;
  }

  validateTaxRebates() {
    this.taxYearInput = this.taxYear.nativeElement.value;

    if (this.taxYearInput == '') return;

    this.negativeTaxYear = false;
    this.taxRebatesExists = false;
    if (Number(this.taxYearInput) < 0) {
      this.negativeTaxYear = true;
      return;
    }

    this.validateTaxRebatesProgress = true;
    this.getTaxRebatesByYearSubscription = this.taxRebatesService.getTaxRebatesByYear(Number(this.taxYearInput)).subscribe(
      response => {
        this.validateTaxRebatesProgress = false;
        if(response) {
          this.taxRebatesExists = true;
        } else {
          this.taxRebatesExists = false;
          this.manageTaxRebates('add', Number(this.taxYearInput))
        }
      },
      error => {
        this.validateTaxRebatesProgress = false;
        this.dataSource = [];
        this.taxRebatesExists = false;
        this.alertService.error(error);
      }
    )
  }

  search() {
    this.getTaxRebatesSubscription = this.taxRebatesService.getTaxRebates().subscribe(
      response => {
        this.showSearchProgress = false;
        if(response && response.length > 0) {
          this.dataSource = response;
        } else {
          this.dataSource = [];
        }
      },
      error => {
        this.showSearchProgress = false;
        this.alertService.error(error);
      }
    )
  }

  manageTaxRebates(action: string, year: number): void {
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
    const taxRebatesNotification = new TaxRebatesNotification();
    taxRebatesNotification.year = year;
    taxRebatesNotification.action = action;
    startWizardRequest.data = JSON.stringify(taxRebatesNotification);
    startWizardRequest.type = 'tax-rebates';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.success(startWizardRequest.type + ' wizard started successfully');
      this.router.navigateByUrl(`/penscare/tax-manager/tax-rebates/continue/${result.id}`);
    });
  }


  checkIfWizardExists(action, year) {
    this.wizardService.getWizardsByType('tax-rebates').subscribe(results => {
      if (results.length > 0) {
        let data: TaxRebatesNotification[] = results.map(item => {
          return JSON.parse(item.data)
        }).filter(item => item !== null);

        if (data.filter(item => item.action === action && item.year === year).length > 0) { // wizard exists
          this.alertService.loading(`${String.capitalizeFirstLetter(action)} Tax Rebates wizard for tax year ${year} already exists`)
        } else { // wizard does not exist
          this.startWizard(action, year)
        }
      } else { // wizard does not exist
        this.startWizard(action, year)
      }
    });
  }

  onMenuItemClick(taxRebate: TaxRebate, menu: any): void {
    switch (menu.action) {
      case 'edit':
        this.manageTaxRebates('edit', taxRebate.year);
        break;
    }
  }

  setPermissions(): void {
    this.canEdit = userUtility.hasPermission('Capture Tax Rebates');
  }

  filterMenu(item: TaxRebate) {
    this.menus = null;
    this.menus =
      [
        { title: 'Edit', action: 'edit', disable: !this.canEdit }
      ];
  }

  ngOnDestroy() {
    if (this.getTaxRebatesSubscription) this.getTaxRebatesSubscription.unsubscribe();
    if (this.getTaxRebatesByYearSubscription) this.getTaxRebatesByYearSubscription.unsubscribe();
  }
}
