import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { EstimateEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-enum';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { Icd10CodeEstimateAmount } from 'projects/shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MedicalEstimatesService } from 'projects/shared-services-lib/src/lib/services/medical-estimates/medical-estimates.service';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { Constant } from 'src/app/shared/constants/constants';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-estimate-basis-view',
  templateUrl: './estimate-basis-view.component.html',
  styleUrls: ['./estimate-basis-view.component.css']
})
export class EstimateBasisViewComponent extends UnSubscribe {

  personEvent: PersonEventModel;

  selectedICDCodes: ICD10Code[] = [];

  @Output() formStatusChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  minEstimate: EstimateEnum = EstimateEnum.Min;
  averageEstimate: EstimateEnum = EstimateEnum.Average;
  maxEstimate: EstimateEnum = EstimateEnum.Max;

  medicalEstimateType: EstimateTypeEnum = EstimateTypeEnum.Medical;
  pdEstimateType: EstimateTypeEnum = EstimateTypeEnum.PDLumpSum;
  ttdEstimateType: EstimateTypeEnum = EstimateTypeEnum.DaysOff;
  icd10CodesEstimatesAmounts: Icd10CodeEstimateAmount[] = [];

  reportDate = new Date();
  dataSource = new MatTableDataSource<ICD10Code>();

  @ViewChild('icd10CodeTable') icd10CodeTable: MatTable<ICD10Code>;
  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }
 
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EstimateBasisViewComponent>,
    private readonly medicalEstimateService: MedicalEstimatesService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.personEvent = this.data.personEvent;
    this.selectedICDCodes = this.data.icd10Codes;
    this.setDataSource();

    if (this.personEvent.firstMedicalReport?.medicalReportForm?.icd10Codes?.length > 0) {
      let codes = '';
      this.selectedICDCodes.forEach(code => {
        codes = codes + (codes.length > 0 ? `, ${code.icd10Code}` : code.icd10Code);
      });
      this.getMedicalEstimates(codes, this.personEvent.firstMedicalReport.medicalReportForm.reportDate);
    } else {
      let codes = '';
      this.selectedICDCodes.forEach(code => {
        codes = codes + (codes.length > 0 ? `, ${code.icd10Code}` : code.icd10Code);
      });
      this.getMedicalEstimates(codes, new Date());
    }
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'icd10Code', show: true },
      { def: 'minEstimatedAmount', show: true },
      { def: 'avgEstimatedAmount', show: true },
      { def: 'maxEstimatedAmount', show: true },
      { def: 'minPDPercentage', show: true },
      { def: 'avgPDPercentage', show: true },
      { def: 'maxPDPercentage', show: true },
      { def: 'minTTD', show: true },
      { def: 'avgTTD', show: true },
      { def: 'maxTTD', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getMedicalEstimates(codes: string, reportDate: Date) {
    this.isLoading$.next(true);

    let icd10CodeFilter = new ICD10EstimateFilter();
    icd10CodeFilter.eventType = this.personEvent.event.eventType;
    icd10CodeFilter.icd10Codes = codes;
    icd10CodeFilter.reportDate = new Date(reportDate);
    this.medicalEstimateService.getICD10Estimates(icd10CodeFilter).subscribe(results => {
      if (results?.length > 0) {
        if (this.icd10CodesEstimatesAmounts.length === 0) {
          this.icd10CodesEstimatesAmounts = results;
        } else {
          results.forEach(icd10CodesEstimatesAmount => {
            const icd10CodeEstimate = this.icd10CodesEstimatesAmounts.find(x => x.icd10Code === icd10CodesEstimatesAmount.icd10Code);
            if (!icd10CodeEstimate) {
              this.icd10CodesEstimatesAmounts.push(icd10CodesEstimatesAmount);
            }
          });
        }
      }
      this.isLoading$.next(false);
    });
  }

  setDataSource() {
    this.dataSource = new MatTableDataSource<ICD10Code>(this.selectedICDCodes);
    this.dataSource.paginator = this.paginator;
  }

  removedSelectedICD10Code(icd10Code: string) {
    if (this.selectedICDCodes.length > 1) {
      const index = this.selectedICDCodes.findIndex(a => a.icd10Code === icd10Code);
      this.selectedICDCodes.splice(index, 1);
      this.setDataSource();
      this.icd10CodeTable.renderRows();
    } else {
      const index = this.selectedICDCodes.findIndex(a => a.icd10Code === icd10Code);
      this.selectedICDCodes.splice(index, 1);
      this.setDataSource();
    }
  }

  getEstimatedAmount(icd10Code: string, estimateEnum: EstimateEnum, estimateTypeEnum: EstimateTypeEnum): string {
    if (this.icd10CodesEstimatesAmounts && this.icd10CodesEstimatesAmounts.length > 0) {
      const icd10CodeEstimate = this.icd10CodesEstimatesAmounts.find(a => a.icd10Code === icd10Code);
      if (icd10CodeEstimate !== undefined) {
        switch (estimateTypeEnum) {
          case EstimateTypeEnum.Medical:
            switch (estimateEnum) {
              case EstimateEnum.Min:
                return icd10CodeEstimate.medicalMinimumCost.toString();
              case EstimateEnum.Average:
                return icd10CodeEstimate.medicalAverageCost.toString();
              case EstimateEnum.Max:
                return icd10CodeEstimate.medicalMaximumCost.toString();
            }

          case EstimateTypeEnum.PDLumpSum:
            switch (estimateEnum) {
              case EstimateEnum.Min:
                return icd10CodeEstimate.pdExtentMinimum.toString();
              case EstimateEnum.Average:
                return icd10CodeEstimate.pdExtentAverage.toString();
              case EstimateEnum.Max:
                return icd10CodeEstimate.pdExtentMaximum.toString();
            }
          case EstimateTypeEnum.DaysOff:
            switch (estimateEnum) {
              case EstimateEnum.Min:
                return icd10CodeEstimate.daysOffMinimum.toString();
              case EstimateEnum.Average:
                return icd10CodeEstimate.daysOffAverage.toString();
              case EstimateEnum.Max:
                return icd10CodeEstimate.daysOffMaximum.toString();
            }
          default:
            return Constant.EstimateNotFound;
        }
      } else {
        return Constant.EstimateNotFound;
      }
    } else {
      return Constant.EstimateNotFound;
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  formatMoney(value: string): string {
    return value && value != '' ? (value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")) + '.00' : value;
  }
}
