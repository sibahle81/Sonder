import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { Icd10CodeListViewComponent } from 'projects/shared-components-lib/src/lib/icd10-code-list-view/icd10-code-list-view.component';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { EventModel } from '../../../entities/personEvent/event.model';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { MedicalEstimatesService } from 'projects/shared-services-lib/src/lib/services/medical-estimates/medical-estimates.service';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { EstimateEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-enum';
import { Constant } from 'src/app/shared/constants/constants';
import { Icd10CodeEstimateAmount } from 'projects/shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { MatTable } from '@angular/material/table';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'estimate-icd-code-list',
  templateUrl: './estimate-icd-code-list.component.html',
  styleUrls: ['./estimate-icd-code-list.component.css']
})
export class EstimateIcdCodeListComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() event: EventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() selectedICDCodes: ICD10Code[] = [];
  @Input() medicalReportForm: FirstMedicalReportForm | ProgressMedicalReportForm | FinalMedicalReportForm;
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

  @ViewChild('icd10CodeTable') icd10CodeTable: MatTable<ICD10Code>;

  constructor(
    private readonly dialog: MatDialog,
    private readonly medicalEstimateService: MedicalEstimatesService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.personEvent.firstMedicalReport && this.personEvent.firstMedicalReport.medicalReportForm 
        && this.personEvent.firstMedicalReport.medicalReportForm.icd10Codes) {
        let codes = '';
        this.selectedICDCodes.forEach(code => {
          codes = codes + (codes.length > 0 ? `, ${code.icd10Code}` : code.icd10Code);
        });
      this.getMedicalEstimates(codes, this.personEvent.firstMedicalReport.medicalReportForm.reportDate);
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
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  openICD10CodeDialog() {
    const dialogRef = this.dialog.open(Icd10CodeListViewComponent, {
      width: '65%',
      maxHeight: '750px',
      data: { eventType: this.event.eventType }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.isLoading$.next(true);
        let codes = '';
        data.forEach(icd10CodeModel => {
          codes = codes + (codes.length > 0 ? `, ${icd10CodeModel.icd10Code}` : icd10CodeModel.icd10Code);
          const icd10Code = new ICD10Code();
          icd10Code.icd10Code = icd10CodeModel.icd10Code;
          icd10Code.icd10CodeDescription = icd10CodeModel.icd10CodeDescription;
          icd10Code.icd10CodeId = icd10CodeModel.icd10CodeId;
          icd10Code.icd10SubCategoryId = icd10CodeModel.icd10SubCategoryId;
          icd10Code.icd10CategoryId = icd10CodeModel.icd10CategoryId;
          icd10Code.icd10DiagnosticGroupId = icd10CodeModel.icd10DiagnosticGroupId;
          if (this.selectedICDCodes.length > 0) {
            const existingICD10Code = this.selectedICDCodes.find(selectedicdCodes => selectedicdCodes.icd10CodeId === icd10Code.icd10CodeId);
            if (!existingICD10Code) {
              this.selectedICDCodes.push(icd10Code);
              this.formStatusChanged.emit(true);
            }
          } else {
            this.selectedICDCodes.push(icd10Code);
          }
        });

        this.getMedicalEstimates(codes, this.reportDate);
      }
    });
  }

  getMedicalEstimates(codes: string, reportDate: Date) {
    this.isLoading$.next(true);

    let icd10CodeFilter = new ICD10EstimateFilter();
    icd10CodeFilter.eventType = this.event.eventType;
    icd10CodeFilter.icd10Codes = codes;
    icd10CodeFilter.reportDate = new Date(reportDate);
    this.medicalEstimateService.getICD10Estimates(icd10CodeFilter).subscribe(results => {
      if (results && results.length > 0) {
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
    })
  }

  removedSelectedICD10Code(icd10Code: string) {
    if (this.selectedICDCodes.length > 1) {
      const index = this.selectedICDCodes.findIndex(a => a.icd10Code === icd10Code);
      this.selectedICDCodes.splice(index, 1);
      this.icd10CodeTable.renderRows();
    } else {
      const index = this.selectedICDCodes.findIndex(a => a.icd10Code === icd10Code);
      this.selectedICDCodes.splice(index, 1);
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

  formatMoney(value: string): string {
    return value && value != '' ? (value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")) + '.00' : value;
  }
}
