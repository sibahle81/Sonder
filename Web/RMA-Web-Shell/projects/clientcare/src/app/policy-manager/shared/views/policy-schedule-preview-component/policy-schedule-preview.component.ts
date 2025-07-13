import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ActivatedRoute } from '@angular/router';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'policy-schedule-preview',
  templateUrl: './policy-schedule-preview.component.html',
  styleUrls: ['./policy-schedule-preview.component.css']
})
export class PolicySchedulePreviewComponent implements OnChanges {

  @Input() reportURL = '';
  @Input() triggerOnChange: any;

  wizardId: number;
  ssrsBaseUrl: string;
  reportServerAudit: string;
  reportUrlAudit: string;
  parametersAudit: any;
  showReport = false;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.onLoadLookups();
  }

  onLoadLookups(): void {
    this.isLoading$.next(true);
    this.activatedRoute.params.subscribe((params: any) => {
      this.wizardId = params.linkedId;
    });
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
      this.generatePolicySchedule(this.wizardId);
      this.isLoading$.next(false);
    });
  }

  generatePolicySchedule(wizardId: number): void {
    if (this.reportURL === '') { return; }
    this.parametersAudit = { WizardId: wizardId };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = this.reportURL;
    this.showReport = true;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
