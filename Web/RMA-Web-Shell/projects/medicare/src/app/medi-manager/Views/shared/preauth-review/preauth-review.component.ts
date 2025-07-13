import { PreAuthRejectReason } from 'projects/medicare/src/app/medi-manager/models/preAuthRejectReason';
import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit } from '@angular/core';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PreAuthReview } from 'projects/medicare/src/app/medi-manager/models/preauthReview';
import { Observable } from 'rxjs';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { RequestType } from 'projects/medicare/src/app/medi-manager/enums/request-type.enum';
import { FormValidation } from 'projects/shared-utilities-lib/src/lib/validators/form-validation';

@Component({
  selector: 'preauth-review',
  templateUrl: './preauth-review.component.html',
  styleUrls: ['./preauth-review.component.css']
})
export class PreauthReviewComponent implements OnInit, AfterViewInit {

  preAuthRejectReasonList$: Observable<PreAuthRejectReason[]>;
  form: UntypedFormGroup;
  @Input() authDetails: PreAuthorisation;
  @Input() authType;
  reviewDetails: PreAuthReview;
  showReason: boolean = false;
  constructor(
    readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly formBuilder: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.createForm();
    this.loadData();    
    FormValidation.markFormTouched(this.form);
  }

  ngAfterViewInit() {
    this.setreviewDetails();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      requestType: new UntypedFormControl('Authorise'),
      rejectReason: new UntypedFormControl(''),
      reviewComments: new UntypedFormControl(''),
    });
    this.reviewDetails = new PreAuthReview();
    this.reviewDetails.requestType = RequestType.Authorise;
    this.reviewDetails.rejectReason = 0;
    this.reviewDetails.reviewComments = '';
  }

  loadData(): void {
    this.preAuthRejectReasonList$ = this.mediCarePreAuthService.getPreAuthRejectReasonList();
  }

  private setreviewDetails(): void {
    this.form
      .get('requestType')
      .valueChanges
      .subscribe((requestType: string) => {
        (requestType === RequestType.Reject || requestType === RequestType.RequestInfo) ? this.showReason = true : this.showReason = false;
        this.reviewDetails.requestType = requestType;
      });

    this.form
      .get('rejectReason')
      .valueChanges
      .subscribe((rejectReason: number) => {
        this.reviewDetails.rejectReason = rejectReason;
      });

    this.form
      .get('reviewComments')
      .valueChanges
      .subscribe((reviewComments: string) => {
        this.reviewDetails.reviewComments = reviewComments;
      });
  }
}
