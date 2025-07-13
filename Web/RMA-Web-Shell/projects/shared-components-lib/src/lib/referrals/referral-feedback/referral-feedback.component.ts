import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';
import { ReferralService } from 'projects/shared-services-lib/src/lib/services/referral/referral.service';
import { BehaviorSubject } from 'rxjs';
import { ReferralStatusEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-status-enum';
import { ReferralFeedback } from 'projects/shared-models-lib/src/lib/referrals/referral-feedback';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'referral-feedback',
  templateUrl: './referral-feedback.component.html',
  styleUrls: ['./referral-feedback.component.css']
})
export class ReferralFeedbackComponent implements OnChanges {

  @Input() referral: Referral; // required
  @Input() directCaptureMode = false; // optional: sets the component to directly ask for feedback eg. when re-assign reason is required directly ask for reason instead of showing all feedback
  @Input() isReadOnly = false; // optional

  @Output() referralEmit = new EventEmitter<Referral>();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  currentUser: User;
  toggle = false;

  colors: { createdBy: string, color: string }[] = [];
  colorList = ['#0084ff', '#eee', '#00ff62', '#b300ff', '#ffb300'];

  closed = ReferralStatusEnum.Closed;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly referralService: ReferralService,
    private readonly authService: AuthService,
    public dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.referral) {
      this.setFeedbackChatColors();
      this.createForm();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      comment: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });

    if (this.directCaptureMode) {
      this.toggleFeedback();
    }

    this.isLoading$.next(false);
  }

  readForm() {
    this.referral.referralFeedbacks = this.referral.referralFeedbacks ? this.referral.referralFeedbacks : [];

    const referralFeedback = new ReferralFeedback();
    referralFeedback.comment = this.form.controls.comment.value;
    referralFeedback.createdBy = this.currentUser.email;
    this.referral.referralFeedbacks.push(referralFeedback);
  }

  confirmReferralOwnershipChange() {
    let message = '';
    let confirm = false;

    if (this.referral.assignedToUserId == this.currentUser.id && (this.referral.referralStatus == ReferralStatusEnum.InProgress || this.referral.referralStatus == ReferralStatusEnum.Disputed)) {
      message = 'Would you like to mark this referral as Actioned or keep it In-Progress under your name while awaiting further feedback?'
      confirm = true;
    } else if (this.referral.assignedByUserId == this.currentUser.id && this.referral.referralStatus == ReferralStatusEnum.Actioned) {
      message = 'Would you like to mark this referral as Disputed or keep it Actioned under your name while awaiting rating and closure?'
      confirm = true;
    }

    if (confirm) {
      const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          title: `Feedback Provided`,
          text: message
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.referral.referralStatus = this.currentUser.id == this.referral.assignedToUserId ? ReferralStatusEnum.Actioned : this.referral.referralStatus == ReferralStatusEnum.Actioned ? ReferralStatusEnum.Disputed : this.referral.referralStatus;
          this.save();
        } else {
          this.save();
        }
      });
    } else {
      this.save();
    }
  }

  save() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('saving...please wait');

    this.readForm();
    if (this.directCaptureMode) {
      this.reset();
      this.referralEmit.emit(this.referral);
    } else {
      this.referralService.updateReferral(this.referral).subscribe(result => {
        this.reset();
        this.referralEmit.emit(result);
      });
    }
  }

  add() {
    this.toggleFeedback();
  }

  cancel() {
    this.reset();
  }

  reset() {
    this.form.controls.comment.reset();
    this.toggleFeedback();
  }

  isAssignmentUser(): boolean {
    return this.currentUser?.id == this.referral.assignedByUserId || this.currentUser?.id == this.referral?.assignedToUserId;
  }

  setFeedbackChatColors() {
    const colorsMap: { [key: string]: string } = {};

    if (this.referral?.referralFeedbacks?.length > 0) {
      const uniqueItems = this.referral.referralFeedbacks.filter((item, index, self) =>
        index === self.findIndex((t) => t.createdBy === item.createdBy)
      );

      if (uniqueItems?.length > 0) {
        let index = 0;
        uniqueItems.forEach(item => {
          if (!colorsMap[item.createdBy]) {
            colorsMap[item.createdBy] = this.colorList[index];
            index++;
          }

          this.colors.push({ createdBy: item.createdBy, color: colorsMap[item.createdBy] });
        });
      }
    }
  }

  getUserColor(createdBy: string): string {
    const userColor = this.colors.find(color => color.createdBy === createdBy);
    return userColor ? userColor.color : '#FFFFFF';
  }

  toggleFeedback() {
    this.toggle = !this.toggle;
  }
}

