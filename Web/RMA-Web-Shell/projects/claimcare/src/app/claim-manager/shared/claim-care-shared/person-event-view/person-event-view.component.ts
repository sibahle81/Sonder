import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { BehaviorSubject } from 'rxjs';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';

@Component({
  selector: 'person-event-view',
  templateUrl: './person-event-view.component.html',
  styleUrls: ['./person-event-view.component.css']
})
export class PersonEventViewComponent implements OnChanges {

  @Input() personEventId: number;

  @Output() personEventEmit = new EventEmitter<PersonEventModel>();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  personEvent: PersonEventModel;
  dataSource: PersonEventModel[] = [];

  constructor(
    private readonly claimService: ClaimCareService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.personEventId && this.personEventId > 0) {
      this.getPersonEvent();
    }
  }

  getPersonEvent() {
    this.claimService.getPersonEvent(this.personEventId).subscribe(result => {
      if (result) {
        this.personEvent = result;
        this.dataSource.push(this.personEvent);
        this.personEventEmit.emit(this.personEvent);
      }
      this.isLoading$.next(false);
    });
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'displayName', show: true },
      { def: 'idNumber', show: true },
      { def: 'personEventNumber', show: true },
      { def: 'personEventStatusId', show: true },
      { def: 'createdDate', show: true },
      { def: 'isStp', show: true },
      { def: 'isStm', show: true },
      { def: 'isFatal', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getPersonEventStatus(personEventStatus: PersonEventStatusEnum): string {
    if (personEventStatus) {
      return this.formatText(PersonEventStatusEnum[personEventStatus]);
    }
    return 'N/A';
  }

  getSuspiciousTransactionStatus(id: number) {
    return this.formatText(SuspiciousTransactionStatusEnum[id]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

}
