import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';
import { ParentInsuranceType } from '../../../entities/parentInsuranceType';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../enums/event-type-enum';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { AccidentService } from '../../../../Services/accident.service';

@Component({
  selector: 'holistic-injury-details',
  templateUrl: './holistic-injury-details.component.html',
  styleUrls: ['./holistic-injury-details.component.css']
})
export class HolisticInjuryDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() eventType: EventTypeEnum;
  @Input() selectedTab = 0;
  @Input() icd10List = [];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  isRoadAccident = false;
  isDeathDate = false;

  suspiciousTransactions: SuspiciousTransactionStatusEnum[];
  parentInsuranceTypes: ParentInsuranceType[];
  disease = EventTypeEnum.Disease;
  accident = EventTypeEnum.Accident;

  hasEditPermissions = false;
  noPersonEventId = false;
  hasDiagnostic = false;
  ledToDeath = false;
  diseasePristine = false;

  constructor(
    private readonly accidentService: AccidentService,
  ) {
    super();
    this.lookups();
  }

  lookups() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.setPermissions();
    this.getData();
  }

  setPermissions() {
    this.hasEditPermissions = this.userHasPermission('View Injury Details');
  }

  refreshPage($event: PersonEventModel) {
    this.personEvent.personEventDeathDetail = $event.personEventDeathDetail;
    this.setConditions($event);
  }

  getData() {
    this.getfirstMedicalReportData();
  }

  setConditions(personEvent: PersonEventModel) {
    this.isRoadAccident = personEvent.personEventAccidentDetail?.isRoadAccident === true ? true : false;
    if (personEvent.personEventDeathDetail) {
      this.ledToDeath = true;
      if (personEvent.personEventDeathDetail.deathDate) {
        this.isDeathDate = true;
      }
    }
    if (this.personEvent.firstMedicalReport && this.personEvent.firstMedicalReport.medicalReportForm.icd10CodesJson) {
      const icd10CodesJson = JSON.parse(
        this.personEvent.firstMedicalReport.medicalReportForm.icd10CodesJson);
        this.setIcd10List(icd10CodesJson);
    }
  }

  setIcd10List(icd10Codes: ICD10Code[]) {
    icd10Codes.forEach(icd10Code => {
      if (!this.icd10List.includes(icd10Code.icd10Code)) {
        this.icd10List.push(icd10Code.icd10Code);
      }
    });
  }

  getfirstMedicalReportData() {
    this.accidentService.getFirstMedicalReportForm(this.personEvent.personEventId).subscribe(result => {
      if (result) {
        this.personEvent.firstMedicalReport = result;
        this.setConditions(this.personEvent);
      }
      this.isLoading$.next(false);
    });
  }
}
