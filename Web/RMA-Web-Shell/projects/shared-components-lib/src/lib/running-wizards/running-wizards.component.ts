import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Wizard } from '../wizard/shared/models/wizard';
import { WizardStatus } from '../wizard/shared/models/wizard-status.enum';
import { WizardService } from '../wizard/shared/services/wizard.service';
import { RefreshService } from 'projects/clientcare/src/app/shared/refresh-service/refresh-service';

@Component({
  selector: 'lib-running-wizards',
  templateUrl: './running-wizards.component.html',
  styleUrls: ['./running-wizards.component.css']
})
export class RunningWizardsComponent implements OnChanges, OnDestroy {

  @Input() linkedItemId: number;
  @Input() wizardTypeCSVs: string; // e.g. 'wizard-type-1,wizard-type-2' etc.
  @Input() moduleName: string; // e.g. 'client-care' OR 'claim-care' OR 'fin-care' etc.
  @Input() managerName: string; // e.g. 'lead-manager' OR 'member-manager' OR 'policy-manager' etc.
  @Input() hideOnNoWizardFound = false; // e.g. true OR false
  @Input() hideActionColumn = false; // e.g. true OR false
  @Input() refresh: boolean; // e.g. true OR false

  @Input() title = 'Active Workflows'; // e.g. default title if none is supplied

  @Output() activeWizardsEmit: EventEmitter<Wizard[]> = new EventEmitter(); // emits an output to notify the parent component the of the active wizards
  @Output() hasWizardsEmit: EventEmitter<boolean> = new EventEmitter(); // emits an output to notify the parent component if wizards were found or not found

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  refreshSubscription: Subscription;

  wizardsInProgress: Wizard[] = [];

  constructor(
    private readonly wizardService: WizardService,
    private readonly refreshService: RefreshService
  ) {
    this.refreshSubscription = this.refreshService.getRefreshPolicyCommand().subscribe
      (refresh => {
        this.getRunningWizardProcesses();
      });
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getRunningWizardProcesses();
  }

  getRunningWizardProcesses() {
    this.isLoading$.next(true);
    if (this.wizardTypeCSVs) {
      this.formatCSVInput();
      this.wizardService.getWizardsInProgressByTypesAndLinkedItemId(this.linkedItemId, this.wizardTypeCSVs).subscribe(results => {
        this.wizardsInProgress = results;

        if (this.wizardsInProgress) {
          this.hasWizardsEmit.emit(this.wizardsInProgress?.length > 0);
        }

        this.activeWizardsEmit.emit(this.wizardsInProgress);
        this.isLoading$.next(false);
      });
    } else {
      this.isLoading$.next(false);
    }
  }

  formatCSVInput() {
    this.wizardTypeCSVs.replace(/\s/g, '').trim();
  }

  formatStatus($event: number): string {
    const status = WizardStatus[$event];
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
