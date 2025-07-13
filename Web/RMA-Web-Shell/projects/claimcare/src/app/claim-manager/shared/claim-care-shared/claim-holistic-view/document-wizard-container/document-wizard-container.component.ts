import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { EventModel } from '../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';

@Component({
  selector: 'document-wizard-container',
  templateUrl: './document-wizard-container.component.html',
  styleUrls: ['./document-wizard-container.component.css']
})
export class DocumentWizardContainerComponent implements OnChanges {

  @Input() selectedPersonEvent: PersonEventModel;
  @Input() event: EventModel;
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() documentSets: DocumentSetEnum[];

  @Output() closeEmployeeContainer: EventEmitter<boolean> = new EventEmitter();

  constructor(
  ) { }

  ngOnChanges(changes: SimpleChanges): void { }

  close() {
    this.closeEmployeeContainer.emit(false);
  }
}
