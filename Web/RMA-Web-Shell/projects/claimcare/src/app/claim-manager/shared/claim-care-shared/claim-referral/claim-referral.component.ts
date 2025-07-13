import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { Claim } from '../../entities/funeral/claim.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimReferralTypeLimitGroupEnum } from './claim-referral-type-limit-group-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { ClaimReferral } from './claim-referral';

@Component({
  selector: 'claim-referral',
  templateUrl: './claim-referral.component.html',
  styleUrls: ['./claim-referral.component.css']
})
export class ClaimReferralComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  canSendReferral$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading claim details...please wait');

  form: UntypedFormGroup;
  currentUserLoggedIn: User;

  referralType: any;
  referralTypes: ClaimReferralTypeLimitGroupEnum[];
  userPermissions = null;
  claim: Claim;
  isReadOnly = false;
  insuredLife: RolePlayer;
  UserReminders: UserReminder[];
  userId: number;

  constructor(
    public dialogRef: MatDialogRef<ClaimReferralComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly userReminderService: UserReminderService,
  ) {
    this.referralType = data.referralType;
    this.referralType = data.claim;
    this.userPermissions = data.permissions;
    this.insuredLife = data.insuredLife;
    this.getLookups();
  }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
    this.createForm();

    this.form.valueChanges.subscribe(result => {
      if (result.valid) {
        this.canSendReferral$.next(true);
      }
    })
  }

  getLookups() {
    this.referralTypes = this.ToArray(ClaimReferralTypeLimitGroupEnum);
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

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      dateCreated: [{ value: '', disabled: true }],
      generatedBy: [{ value: '', disabled: true }],
      referralType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      claimNumber: [{ value: '', disabled: true }],
      insuredLifeName: [{ value: '', disabled: this.isReadOnly }],
      contactNumber: [{ value: '', disabled: this.isReadOnly }],
      message: [{ value: '', disabled: this.isReadOnly }, Validators.required],

    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      dateCreated: new Date(),
      generatedBy: this.currentUserLoggedIn ? this.currentUserLoggedIn.displayName : null,
      referralType: this.data.referralType ? this.data.referralType : null,
      claimNumber: this.data.claim ? this.data.claim.claimReferenceNumber : null,
      insuredLifeName: this.data.insuredLife ? this.data.insuredLife.person.firstName + ' ' + this.data.insuredLife.person.surname: null,
      contactNumber: this.data.insuredLife ? this.data.insuredLife.cellNumber : null,
      message: this.data.insuredLife ? this.data.insuredLife.cellNumber : null,
    });

    this.isLoading$.next(false);
  }

  referralTypeChange($event: ClaimReferralTypeLimitGroupEnum) {

  }

  cancel() {
    this.dialogRef.close(null);
  }

  usersSelected($event: any) {
    if ($event && this.form.valid && !this.form.pristine) {
      this.userId = $event;
      this.canSendReferral$.next(true);
    }
  }

  save() {
    let claimReferral = this.readForm();
    this.createUserReminders(this.userId, this.data.claim, UserReminderItemTypeEnum.Claim, claimReferral)
  }
  
  readForm(): any {
    if (!this.form.valid) { return; }
    const formDetails = this.form.getRawValue();
    let claimReferral = new ClaimReferral();
    claimReferral.createdDate = formDetails.dateCreated;
    claimReferral.createdBy = formDetails.generatedBy;
    claimReferral.referralType = formDetails.referralType;
    claimReferral.claimNumber = formDetails.claimNumber;
    claimReferral.insuredLifeName = formDetails.insuredLifeName;
    claimReferral.contactNumber = formDetails.contactNumber;
    claimReferral.message = formDetails.message;

    return claimReferral;
  }

  createUserReminders(userId: number, claim: Claim, userReminderItemTypeEnum: UserReminderItemTypeEnum, claimReferral: ClaimReferral) {
    this.isLoading$.next(true);
    const userReminder = new UserReminder();
    userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
    userReminder.userReminderItemType = userReminderItemTypeEnum;
    userReminder.text = `${claimReferral}`;
    userReminder.assignedByUserId = this.currentUserLoggedIn.id;
    userReminder.assignedToUserId = userId;
    userReminder.alertDateTime = new Date().getCorrectUCTDate();
    userReminder.linkUrl = 'claim-manager/find-campaign';

    this.UserReminders.push(userReminder);

    this.userReminderService.createUserReminders(this.UserReminders).subscribe(result => {
      if (result) {
        this.isLoading$.next(false);
      } else {
        this.isLoading$.next(false);
      }
    });
  }
}
