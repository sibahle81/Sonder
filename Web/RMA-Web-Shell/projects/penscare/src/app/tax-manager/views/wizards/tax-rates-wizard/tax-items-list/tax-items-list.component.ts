import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDeleteDialogComponent } from 'projects/penscare/src/app/pensioncase-manager/views/wizards/initiate-pension-case-wizard/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { TaxRatesNotification } from '../../../../models/tax-rates-notification.model';
import { TaxRate } from '../../../../models/tax-rate.model';
import 'src/app/shared/extensions/array.extensions';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { PensionTaxService } from '../../../../services/pension-tax.service';

@Component({
  selector: 'app-tax-items-list',
  templateUrl: './tax-items-list.component.html',
  styleUrls: ['./tax-items-list.component.css']
})
export class TaxItemsListComponent extends WizardDetailBaseComponent<TaxRatesNotification> implements OnInit, OnDestroy {
  taxRatesDataSource: TaxRate[] = [];
  viewTaxInformation = false;
  isLoading = false;
  modifiedData: TaxRate;
  menus: { title: string, action: string, disable: boolean }[];


  public fromIncome : number;
  public toIncome: number;
  public standardTaxRate: number;
  public taxPercentageRate: number;

  displayedColumns;
  taxRatesSubscription: any;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private dialog: MatDialog,
    private taxRatesService: PensionTaxService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }


  ngOnInit(): void {
    this.setPermissions();
    this.createForm();
  }

  setPermissions() {
    const awaitingApproval = this.context.wizard.wizardStatusId === WizardStatus.AwaitingApproval;
    const hasEditPermission = userUtility.hasPermission('Add Tax Rates');

    this.canEdit = !awaitingApproval;
    if (this.canEdit) {
      this.canEdit = hasEditPermission
    }

    if (this.canEdit) {
      this. displayedColumns = ['fromIncome', 'toIncome', 'standardTaxRate','taxPercentageRate', 'actions'];
    } else {
      this. displayedColumns = ['fromIncome', 'toIncome', 'standardTaxRate','taxPercentageRate'];
    }
  }

  createForm(): void {
    if (this.form) { return;}
    this.form = this.formBuilder.group({
    });
  }
  onLoadLookups(): void {

  }
  populateModel(): void {
    this.model.taxRates = this.taxRatesDataSource;
  }
  populateForm(): void {
    if (this.model.taxRates && this.model.taxRates.length !== 0) {
      this.taxRatesDataSource = this.resetDataSourceIndeces(this.model.taxRates);
    } else {
      this.isLoading = true;
      this.taxRatesSubscription = this.taxRatesService.getTaxRates(this.model.taxYear).subscribe(
        response => {
          this.isLoading = false;
          this.taxRatesDataSource = this.resetDataSourceIndeces(response);
        }
      )
    }
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  ngOnDestroy(): void {
    if (this.taxRatesSubscription) {
      this.taxRatesSubscription.unsubscribe();
    }
  }

  resetDataSourceIndeces(taxRatesDataSource: TaxRate[]) {
    // sortByFromIncome
    let _taxRatesDataSource = Array.sortByParameter(taxRatesDataSource, 'fromIncome', 'ASC');


    _taxRatesDataSource = _taxRatesDataSource.map((taxRate, index) => {
      const newTaxRate = taxRate;
      newTaxRate.index = index;
      return newTaxRate;
    });

    return _taxRatesDataSource;
  }

  onCancelButtonClicked() {
    this.viewTaxInformation = false;
  }

  onAddTaxRate() {
    this.modifiedData = null;
    this.viewTaxInformation = true;
  }

  editTaxRate(taxRate: TaxRate) {
    this.modifiedData = taxRate;
    this.viewTaxInformation = true;
  }

  filterMenu(item: TaxRate) {
    this.menus = null;
    this.menus =
      [
        { title: 'Edit', action: 'edit', disable: !this.canEdit },
        { title: 'Delete', action: 'delete', disable: !this.canEdit }
      ];
  }

  confirmDeleteTaxRate(taxRate: TaxRate) {
    const dialog = this.dialog.open(
      ConfirmDeleteDialogComponent, this.getDialogConfig()
    );
    dialog.afterClosed().subscribe((data) => {
      if (data.delete) {
        this.deleteTaxRate(taxRate);
      }
    });
  }

  deleteTaxRate(taxRate: TaxRate) {
    const _taxRatesDataSource = this.taxRatesDataSource.filter(_taxRate => _taxRate.index !== taxRate.index);
    this.taxRatesDataSource = this.resetDataSourceIndeces(_taxRatesDataSource);
  }

  getDialogConfig(): MatDialogConfig {
    const config = new MatDialogConfig();
    config.data = {
      type: "this row"
    };
    return config;
  }

  onSaveButtonClicked (data) {
    let isNewData = true;
    let _taxRatesDataSource: TaxRate[];

    data.taxRatesDataSource.forEach((taxRate: TaxRate) => {
      if (taxRate.index === data.modifiedData.index) {
        isNewData = false;
      }
    });

    if (isNewData) { // New data
      _taxRatesDataSource = data.taxRatesDataSource;
      _taxRatesDataSource.push(data.modifiedData);
    } else { // edited data
      _taxRatesDataSource = data.taxRatesDataSource.map((taxRate: TaxRate) => {
        if (taxRate.index == data.modifiedData.index) {
          return data.modifiedData
        }
        return taxRate
      });
    }

    this.taxRatesDataSource = this.resetDataSourceIndeces(_taxRatesDataSource);
    this.viewTaxInformation = false;
  }

  onMenuItemClick(taxRate: TaxRate, menu: any): void {
    switch (menu.action) {
      case 'edit':
        this.editTaxRate(taxRate);
        break;
      case 'delete':
        this.confirmDeleteTaxRate(taxRate);
        break;
    }
  }

}
