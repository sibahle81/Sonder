import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { ContactInformationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-information-type-enum';
import { EventModel } from '../../../entities/personEvent/event.model';

@Component({
  selector: 'employee-container',
  templateUrl: './employee-container.component.html',
  styleUrls: ['./employee-container.component.css']
})
export class EmployeeContainerComponent implements OnChanges {

  @Input() event: EventModel;
  @Input() personEvent: PersonEventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() mode = ModeEnum.Default;
  @Input() selectedTab = 0;

  @Output() closeEmployeeContainer: EventEmitter<boolean> = new EventEmitter();
  @Output() addPersonEvent: EventEmitter<PersonEventModel> = new EventEmitter();

  filteredInformationTypes = [ContactInformationTypeEnum.Claims];
  filteredDesignationTypes = [ContactDesignationTypeEnum.PrimaryContact];

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  isStp = false;
  isEmployee = false;
  isEmployment = false;
  requiredPersonalDocumentsUploaded = false;
  requiredMedicalDocumentsUploaded = false;

  constructor(
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.mode = this.mode;
    this.setTheme(this.personEvent);
  }

  close() {
    this.closeEmployeeContainer.emit(false);
  }

  createNewPersonEvent($event: PersonEventModel) {
    this.addPersonEvent.emit($event);
    this.setTheme($event);
  }

  setEmployeeColor($event: PersonEventModel) {
    this.isEmployee = $event.rolePlayerExist ? true : this.personEvent && this.personEvent.rolePlayer?.person?.idType > 0 ? true : false;
  }

  setEmploymentColor($event: PersonEventModel) {
    this.isEmployment = $event?.rolePlayer?.person?.personEmployments?.length > 0 ? true : false;
  }

  setTheme($event: PersonEventModel) {
    this.setEmployeeColor($event);
    this.setEmploymentColor($event);
  }
}
