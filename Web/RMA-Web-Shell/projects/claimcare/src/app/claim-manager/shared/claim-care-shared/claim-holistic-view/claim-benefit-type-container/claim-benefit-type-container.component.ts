import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';

@Component({
  selector: 'claim-benefit-type-container',
  templateUrl: './claim-benefit-type-container.component.html',
  styleUrls: ['./claim-benefit-type-container.component.css']
})
export class ClaimBenefitTypeContainerComponent extends UnSubscribe implements OnChanges{

  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading benefit types...please wait');

  BenefitTypes: any[] = [];
  type: any;
  
  constructor( private readonly formBuilder: UntypedFormBuilder) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.personEvent.personEventId) { return }
    this.isLoading$.next(false);
  }

  getLookups() {}

  onBenefitChange($event: any) {
    this.type = +this.BenefitTypes[$event.value];
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
