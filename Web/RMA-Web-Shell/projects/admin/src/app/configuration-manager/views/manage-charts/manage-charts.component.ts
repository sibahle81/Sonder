import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../../../../../../shared-services-lib/src/lib/services/alert/alert.service';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ProductCrossRefTranType } from '../../shared/productCrossRefTranType.model';
import { ProductCrossRefTranTypeService } from '../../shared/productCrossRefTranType.service';
import { ChartsListDatasource } from './chart-list/charts-list.datasource';

@Component({
  selector: 'app-manage-charts',
  templateUrl: './manage-charts.component.html',
  styleUrls: ['./manage-charts.component.css']
})
export class ManageChartsComponent extends DetailsComponent implements OnInit {
  showHideDetails: number;
  mode = '';
  validResults: boolean;
    isSave: number;
    productCrossRefTranType: ProductCrossRefTranType;
  constructor(
      private readonly formBuilder: UntypedFormBuilder,
      private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService,
      private readonly router: Router,
      private readonly authService: AuthService,
      private readonly dataSource: ChartsListDatasource,
      appEventsManager: AppEventsManager,
      private readonly alertService: AlertService) {
      super(appEventsManager, alertService, router, 'Manage Charts', 'configuration-manager/', 0);

  }

  ngOnInit() {
      this.showHideDetails = 0;
  }

  createForm(id: any): void {
      if (this.form) { return; }

      this.form = this.formBuilder.group({
          id,
          productCode: ['', [Validators.required]],
          origin: '',
          company: ['', [Validators.required]],
          branch: ['', [Validators.required]],
          transactionType: ['', [Validators.required]],
          level1: ['', [Validators.required]],
          level2: ['', [Validators.required]],
          level3: ['', [Validators.required]],
          ISChartNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
          ISChartName: ['', [Validators.required]],
          BSChartNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
          BSChartName: ['', [Validators.required]],
          BenefitCode: ''
      });
  }

  validateForm(): boolean {
    if (this.form.get('productCode').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('company').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('branch').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('transactionType').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('level1').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('level2').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('level3').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('ISChartNo').hasError('required') || this.form.get('ISChartNo').hasError('pattern')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('ISChartName').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('BSChartNo').hasError('required') || this.form.get('BSChartNo').hasError('pattern')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    if (this.form.get('BSChartName').hasError('required')) {
        this.validResults = false;
    } else {
        this.validResults = true;
    }
    return this.validResults;
}

  readForm(): ProductCrossRefTranType {
      const productCrossRefTranType = new ProductCrossRefTranType();
      productCrossRefTranType.origin = this.form.controls.origin.value;
      productCrossRefTranType.productCodeId = this.form.controls.productCode.value;
      productCrossRefTranType.companyNo = this.form.controls.company.value;
      productCrossRefTranType.branchNo = this.form.controls.branch.value;
      productCrossRefTranType.transactionType = this.form.controls.transactionType.value;
      productCrossRefTranType.level1 = this.form.controls.level1.value;
      productCrossRefTranType.level2 = this.form.controls.level2.value;
      productCrossRefTranType.level3 = this.form.controls.level3.value;
      productCrossRefTranType.chartISNo = this.form.controls.ISChartNo.value;
      productCrossRefTranType.chartIsName = this.form.controls.ISChartName.value;
      productCrossRefTranType.chartBSNo = this.form.controls.BSChartNo.value;
      productCrossRefTranType.chartBsName = this.form.controls.BSChartName.value;
      productCrossRefTranType.benefitcode = this.form.controls.BenefitCode.value;
      return productCrossRefTranType;
  }

  setForm(productCrossRefTranType: ProductCrossRefTranType): void {
      if (!this.form) { this.createForm(productCrossRefTranType.id); }
      this.form.controls.origin.setValue(productCrossRefTranType.origin);
      this.form.controls.productCode.setValue(productCrossRefTranType.productCodeId);
      this.form.controls.company.setValue(productCrossRefTranType.companyNo);
      this.form.controls.branch.setValue(productCrossRefTranType.branchNo);
      this.form.controls.transactionType.setValue(productCrossRefTranType.transactionType);
      this.form.controls.level1.setValue( productCrossRefTranType.level1);
      this.form.controls.level2.setValue(productCrossRefTranType.level2);
      this.form.controls.level3.setValue(productCrossRefTranType.level3);
      this.form.controls.ISChartNo.setValue(productCrossRefTranType.chartISNo);
      this.form.controls.ISChartName.setValue(productCrossRefTranType.chartIsName);
      this.form.controls.BSChartNo.setValue(productCrossRefTranType.chartBSNo);
      this.form.controls.BSChartName.setValue(productCrossRefTranType.chartBsName);
      this.form.controls.BenefitCode.setValue(productCrossRefTranType.benefitcode);
  }

    save() {
        if (this.validateForm() === true) {
        this.validateDetails();
        if (this.mode === 'Edit') {
            const productCrossRefTranType = this.readForm();
            productCrossRefTranType.id = this.productCrossRefTranType.id;
            productCrossRefTranType.isActive = this.productCrossRefTranType.isActive;
            productCrossRefTranType.isDeleted = this.productCrossRefTranType.isDeleted;
            productCrossRefTranType.createdBy = this.authService.getUserEmail();
            productCrossRefTranType.modifiedBy = this.authService.getUserEmail();
            this.productCrossRefTranTypeService.editProductCrossRefTranType(productCrossRefTranType).subscribe(() => {
                this.done('ProductCrossRefTranType updated successfully');

            });
        }
        if (this.mode === 'Add') {
            const productCrossRefTranType = this.readForm();
            productCrossRefTranType.isActive = true;
            productCrossRefTranType.isDeleted = false;
            productCrossRefTranType.createdBy = this.authService.getUserEmail();
            productCrossRefTranType.modifiedBy = this.authService.getUserEmail();
            this.productCrossRefTranTypeService.addProductCrossRefTranType(productCrossRefTranType).subscribe(() => {
                this.done('ProductCrossRefTranType added successfully');
            });
        }
    }
        // this.showHideDetails = 0;
    }

    done(statusMesssage: string) {
        this.alertService.success(statusMesssage, 'Success', true);
        this.dataSource.isLoading = true;
        this.dataSource.getData();
        this.showHideDetails = 0;
    }

  validateDetails() {
    // need to do validation here
  }

  clear() {
    this.router.navigate(['config-manager/manage-charts']);
  }

  edit() {
      this.form.enable();
      this.isSave = 1;
      this.mode = 'Edit';
  }

    add() {
        this.isSave = 1;
        this.createForm('');
        this.mode = 'Add';
        this.showHideDetails = 1;
  }



  chartChangeHandler(productCrossRefTranType: ProductCrossRefTranType): void {
      this.showHideDetails = 1;
      this.productCrossRefTranType = productCrossRefTranType;
      this.loadingStart('Loading details....');
      this.setForm(productCrossRefTranType);
      this.form.disable();
      this.isSave = 0;
      this.loadingStop();
  }
}

