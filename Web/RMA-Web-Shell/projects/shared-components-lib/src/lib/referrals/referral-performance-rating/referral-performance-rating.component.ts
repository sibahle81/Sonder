import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';
import { ReferralService } from 'projects/shared-services-lib/src/lib/services/referral/referral.service';
import { BehaviorSubject } from 'rxjs';
import { ReferralRatingEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-rating-enum';
import { ReferralPerformanceRating } from 'projects/shared-models-lib/src/lib/referrals/referral-performance-rating';
import { ReferralStatusEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-status-enum';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'referral-performance-rating',
  templateUrl: './referral-performance-rating.component.html',
  styleUrls: ['./referral-performance-rating.component.css']
})
export class ReferralPerformanceRatingComponent implements OnChanges {

  @Input() referral: Referral; // required
  @Input() isReadOnly = false; // optional

  @Output() referralEmit = new EventEmitter<Referral>();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  referralRatings: ReferralRatingEnum[];

  closed: ReferralStatusEnum.Closed;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly referralService: ReferralService,
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.referral) {
      this.isReadOnly = this.referral.referralPerformanceRatingId > 0;
      this.getLookups();
    }
  }

  getLookups() {
    this.referralRatings = this.ToArray(ReferralRatingEnum);
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      referralRating: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      comment: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      referralRating: this.referral.referralPerformanceRating ? ReferralRatingEnum[+this.referral.referralPerformanceRating.referralRating] : null,
      comment: this.referral.referralPerformanceRating ? this.referral.referralPerformanceRating.comment : null
    });

    this.isLoading$.next(false);
  }

  readForm() {
    this.referral.referralPerformanceRating = new ReferralPerformanceRating();
    this.referral.referralPerformanceRating.referralRating = +ReferralRatingEnum[this.form.controls.referralRating.value];
    this.referral.referralPerformanceRating.comment = this.form.controls.comment.value;
  }

  confirmClosure() {
    if (confirm) {
      const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          title: `Performance Rating Provided`,
          text: `By providing a rating, the referral status will be set to Closed. Would you like to proceed?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.referral.referralStatus = ReferralStatusEnum.Closed;
          this.save();
        }
      });
    }
  }

  save() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('saving...please wait');

    this.readForm();

    this.referralService.updateReferral(this.referral).subscribe(result => {
      this.referralEmit.emit(result);
    });

  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}

