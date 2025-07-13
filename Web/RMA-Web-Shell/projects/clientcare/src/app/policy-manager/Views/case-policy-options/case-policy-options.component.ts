import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ProductOption } from '../../../product-manager/models/product-option';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-case-policy-options',
  templateUrl: './case-policy-options.component.html',
  styleUrls: ['./case-policy-options.component.css']
})
export class CasePolicyOptionsComponent extends WizardDetailBaseComponent<ProductOption[]> {

  productOptions: ProductOption[] = [];
  dataSource = new MatTableDataSource<ProductOption>();
  displayedColumns = ['selected', 'code', 'description', 'statusText'];
  selectedIds: number[];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm() { }

  onLoadLookups() { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm() {
    this.productOptionService.getProductOptions().subscribe(results => {
      this.productOptions = results;
    });

    if (this.selectedIds != null) {
      this.selectedIds.forEach(b => {
        const productOption = this.productOptions.find(a => a.id === b);
        if (productOption != null) {
          productOption.selected = true;
        }
      });
    }

    this.dataSource.data = this.productOptions;
  }

  populateModel() {
    const selected = this.dataSource.data.filter(d => d.selected).map(a => a.id);
    this.selectedIds = selected;
  }

  addProductOption(event: any, productOption: ProductOption) {
      productOption.selected = event.checked;
  }
}
