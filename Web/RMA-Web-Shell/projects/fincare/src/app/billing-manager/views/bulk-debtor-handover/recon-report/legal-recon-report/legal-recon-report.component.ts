import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { LegalCollectionTypeEnum } from 'projects/fincare/src/app/shared/enum/legal-collection-type.enum';
import { PreDefinedDateFilterEnum } from 'projects/shared-components-lib/src/lib/report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/models/pre-defined-range-date-filter.enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { BillingService } from '../../../../services/billing.service';
import { tap } from 'rxjs/operators';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-legal-recon-report',
  templateUrl: './legal-recon-report.component.html',
  styleUrls: ['./legal-recon-report.component.css']
})
export class LegalReconReportComponent extends PermissionHelper implements OnInit {

  selectedPolicy: Policy;
  selectedAttorney: string;
  form: FormGroup;

  defaultDateRange = PreDefinedDateFilterEnum.ThisMonth;

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;
  reportUrl: string;
  parameters: KeyValue<string, string>[];
  collectionTypes: { id: number, name: string }[] = [];
  attorneys: { key: string, value: string }[] = [];
  selectedCollectionTypeId: number;

  constructor(private readonly formBuilder: FormBuilder,
    private readonly billingService: BillingService
  ) {
    super();
  }
  ngOnInit(): void {
    this.reportUrl = 'RMA.Reports.FinCare/RMALegalReconReport';
    this.collectionTypes = this.ToKeyValuePair(LegalCollectionTypeEnum);
    this.getAttorneys();
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      collectionType: [],
      attorney: []
    });
  }

  reportSelected($event: any) {
    this.selectedReport = $event;
    this.reportUrl = this.selectedReport.value;
    this.reset();
  }

  periodFilterChanged($event: KeyValue<string, string>[]) {
    const parameter = $event;
    this.setParameters(parameter);
  }

  attorneyChanged($event: MatRadioChange) {
    const parameter = [{ key: 'Attorney', value: $event.value.toString() }];
    this.setParameters(parameter);
  }

  collectionTypeChanged($event: MatRadioChange) {
    const parameter = [{ key: 'CollectionTypeId', value: $event.value.toString() }];
    this.setParameters(parameter);
  }

  setParameters($event: KeyValue<string, string>[]) {
    if (!this.parameters) {
      this.parameters = [];
      this.parameters = $event;
    } else {
      $event.forEach(parameter => {
        const index = this.parameters.findIndex(s => s.key == parameter.key);
        if (index > -1) {
          this.parameters[index] = parameter;
        } else {
          this.parameters.push(parameter);
        }
      });

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
  }

  reset() {
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;
    this.triggerReset = !this.triggerReset;    
    this.form.reset();
  }


  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  getAttorneys() {
    this.billingService.getAttorneysForRecon().pipe(
      tap((data) => {
        if (data && data.length > 0) {
          data.forEach(c => {
            this.attorneys.push({ key: c, value: c })
          });
        }
      })
    ).subscribe();
  }
}