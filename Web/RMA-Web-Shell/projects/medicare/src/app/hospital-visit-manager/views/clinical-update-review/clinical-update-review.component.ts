import { PreAuthRejectReason } from 'projects/medicare/src/app/medi-manager/models/preAuthRejectReason';
import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit } from '@angular/core';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PreAuthReview } from 'projects/medicare/src/app/medi-manager/models/preauthReview';
import { Observable } from 'rxjs';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { FormValidation } from 'projects/shared-utilities-lib/src/lib/validators/form-validation';

@Component({
  selector: 'clinical-update-review',
  templateUrl: './clinical-update-review.component.html',
  styleUrls: ['./clinical-update-review.component.css']
})
export class ClinicalUpdateReviewComponent implements OnInit, AfterViewInit {
  @Input() clinicalUpdateDetails: ClinicalUpdate;
  form: UntypedFormGroup;
  preAuthRejectReasonList$: Observable<PreAuthRejectReason[]>;
  @Output() reviewDetails: EventEmitter<PreAuthReview> = new EventEmitter();
  @Output() validationResults: EventEmitter<ValidationResult> = new EventEmitter();
  showReason: boolean = false;


  constructor(readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly formBuilder: UntypedFormBuilder) { }

  ngOnInit() {
    this.createForm();
    this.loadData();       
    FormValidation.markFormTouched(this.form);  
  }

  ngAfterViewInit() {
    this.emitDataToParent();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      requestType: new UntypedFormControl('Authorise'),
      rejectReason: new UntypedFormControl(''),
      reviewComments: new UntypedFormControl(this.clinicalUpdateDetails ? this.clinicalUpdateDetails.reviewComment : ''),
    });
  }

  loadData(): void {
    this.preAuthRejectReasonList$ = this.mediCarePreAuthService.getPreAuthRejectReasonList();
  }

  private emitDataToParent(): void { 
    this.form
      .valueChanges
      .subscribe((preAuthReview: PreAuthReview) => {
        this.reviewDetails.emit(preAuthReview)
      });

    this.form
      .get('requestType')
      .valueChanges
      .subscribe((requestType: string) => {
        (requestType === 'Reject' || requestType === 'RequestInfo') ? this.showReason = true : this.showReason = false;
      });
  }

}
