import { Component, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { BenefitCategoryFuneral } from '../../../../shared/entities/benefit-category-funeral';
import { LookupService } from '../../../../../../../../shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from '../../../../../../../../shared-models-lib/src/lib/lookup/lookup';
import { WizardDetailBaseComponent } from '../../../../../../../../shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { GroupRiskEmployerPremiumRateModel } from '../../../../shared/entities/group-risk-employer-premium-rate--model';
import { ValidationResult } from '../../../../../../../../shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from '../../../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { GroupRiskPolicyCaseService } from '../../../../shared/Services/group-risk-policy-case.service';
import { ConfirmationDialogsService } from '../../../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service';

@Component({
  selector: 'grouprisk-funeral-custom-scale',
  templateUrl: './funeral-custom-scale.component.html',
  styleUrls: ['./funeral-custom-scale.component.css']
})
export class FuneralCustomScaleComponent extends WizardDetailBaseComponent<GroupRiskEmployerPremiumRateModel>{
   
  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute,
    private groupRiskService: GroupRiskPolicyCaseService,
    private readonly confirmService: ConfirmationDialogsService) {
    super(appEventsManager, authService, activatedRoute);
  }

  @ViewChild('funeralScalesTable') funeralScalesTable: MatTable<BenefitCategoryFuneral>;

  funeralScalesDataSource = new MatTableDataSource<BenefitCategoryFuneral>();
  displayedColumns = [
    "funeralInsuredTypeId",
    "effectiveDate",
    "coverAmount",
    "actions"
  ];
  insuredTypes: Lookup[];

  createForm(id: number): void {
      
  }
  onLoadLookups(): void {
    this.groupRiskService.getFuneralInsuredTypes().subscribe({
      next: (result) => {
        this.insuredTypes = result.sort((a, b) => a < b ? -1 : 1); 
      }
    })
  }
  populateModel(): void {
      
  }
  populateForm(): void {
      
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
  
  add() {
    var benefitCategoryFuneral: BenefitCategoryFuneral = { benefitCategoryId: 0, effectiveDate: null, funeralInsuredTypeId: 0, coverAmount: 0};
    this.funeralScalesDataSource.data.push(benefitCategoryFuneral);
    this.refreshTable();
  }

  delete(item: any, rowIndex: number) {
    this.confirmService
      .confirmWithoutContainer(
        "Remove Custom Scale",
        "Are you sure you want to remove this entry?",
        "Center",
        "Center",
        "Yes",
        "No",
      )
      .subscribe((result) => {
        if (result === true) {
          this.funeralScalesDataSource.data.splice(rowIndex, 1);
          this.refreshTable();
        }
      });
  }

  refreshTable() {
    if(this.funeralScalesTable)
      this.funeralScalesTable.renderRows();
  }

  clearData() {
    this.funeralScalesDataSource.data = [];
    this.refreshTable();
  }

  getCreatedFuneralScales(): BenefitCategoryFuneral[] {
    var noResult:BenefitCategoryFuneral[] = [];
    if (this.funeralScalesDataSource)
      return this.funeralScalesDataSource.data;
    else
      return [];
  }

  setTableData(funeralScales: BenefitCategoryFuneral[]) {
    this.funeralScalesDataSource.data = funeralScales;
    this.refreshTable();
  }

  canEditEffectiveDate(funeralScale: BenefitCategoryFuneral): boolean {
    return (funeralScale.benefitCategoryId > 0) ? false : true;
  }

}
