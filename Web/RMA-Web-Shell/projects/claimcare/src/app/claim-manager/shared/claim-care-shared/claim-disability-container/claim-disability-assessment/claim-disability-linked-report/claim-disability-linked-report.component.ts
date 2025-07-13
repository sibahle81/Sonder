import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PersonEvent } from '../../../../entities/funeral/person-event';
import { AccidentService } from 'projects/claimcare/src/app/claim-manager/Services/accident.service';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { EventModel } from '../../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { MedicalReportTypeEnum } from '../../../medical-upload-icon/medical-report-type.enum';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimDisabilityAssessment } from '../../../../entities/claim-disability-assessment';

@Component({
  selector: 'claim-disability-linked-report',
  templateUrl: './claim-disability-linked-report.component.html',
  styleUrls: ['./claim-disability-linked-report.component.css']
})
export class ClaimDisabilityLinkedReportComponent extends UnSubscribe implements OnInit {

  @Input() claimDisabilityAssessment: ClaimDisabilityAssessment;
  @Input() personEvent: PersonEvent;
  @Input() isReadOnly = false; // optional

  @Output() finalMedicalReportEmit: EventEmitter<Array<FinalMedicalReportForm>> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  selectedPersonEvent: PersonEventModel;
  event: EventModel;
  medicalReportType: MedicalReportTypeEnum;
  selectedMedicalReports: FinalMedicalReportForm[] = [];
  medicalReportForm: FinalMedicalReportForm[] = [];
  dataSource = new MatTableDataSource<FinalMedicalReportForm>();
  
  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }
  
  constructor(
    private readonly claimAccidentService: AccidentService,
    private claimCareService: ClaimCareService,
  ) {
    super();
  }

  ngOnInit() {
    if (!this.personEvent.personEventId) { return }
    this.medicalReportType = MedicalReportTypeEnum.FinalMedicalReport;
    this.getData();
  }

  getData() {
    this.claimCareService.getEvent(this.personEvent.eventId).subscribe((event: EventModel) => {
      if (event) {
        this.event = event;
        this.selectedPersonEvent = event.personEvents[0];
        this.getFinalMedicalReport();
      }
      this.isLoading$.next(true);
    });
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  refresh(value: boolean) {
    if (value) {
      this.getFinalMedicalReport();
    }
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'select', show: true },
      { def: 'reportDate', show: true },
      { def: 'reportType', show: true },
      { def: 'practitioner', show: true },
      { def: 'dateStabilised', show: true },
      { def: 'estDaysOff', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getFinalMedicalReport() {
    this.claimAccidentService.GetFinalMedicalReportForms(this.personEvent.personEventId).subscribe((result) => {
      if (result) {
        this.medicalReportForm = result;
        this.isLoading$.next(false);
        this.dataSource = new MatTableDataSource(this.medicalReportForm);
        this.dataSource.paginator = this.paginator;
        setTimeout(() => { this.dataSource.paginator = this.paginator; });
      } 
      else { 
        this.isLoading$.next(false); 
      }
    });
  }

  getMedicalFormReportType(id: number) {
    return this.formatText(MedicalFormReportTypeEnum[id]);
  }

  autoSelectLinkedReport(row: FinalMedicalReportForm): boolean {
    const assessmentMedicalReportFormId = this.claimDisabilityAssessment?.medicalReportFormId;
    if (assessmentMedicalReportFormId) {
      return row.medicalReportForm.medicalReportFormId === assessmentMedicalReportFormId;
    }
    return false;
  }

  addCheckedItems($event: any, row: FinalMedicalReportForm) {
    if ($event.checked) {
      this.selectedMedicalReports.push(row);
    }
    else {
      let index = this.selectedMedicalReports.findIndex(x => x.finalMedicalReportFormId == row.finalMedicalReportFormId);
      if (index !== -1) {
        this.selectedMedicalReports.splice(index, 1);
      }
    }
    this.finalMedicalReportEmit.emit(this.selectedMedicalReports);
  };
}
