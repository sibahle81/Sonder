import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { ReferralReportsDialogComponent } from './referral-reports-dialog/referral-reports-dialog.component';
import { ReferralService } from 'projects/shared-services-lib/src/lib/services/referral/referral.service';
import { BehaviorSubject } from 'rxjs';
import { ReferralNatureOfQuerySearchDialogComponent } from '../paged-referral-nature-of-query-search/referral-nature-of-query-search-dialog/referral-nature-of-query-search-dialog.component';

@Component({
  selector: 'referral-view',
  templateUrl: './referral-view.component.html',
  styleUrls: ['./referral-view.component.css']
})
export class ReferralViewComponent {

  @Input() sourceModuleType: ModuleTypeEnum; // optional: use only if you want lock the referral search results to the source module 
  @Input() targetModuleType: ModuleTypeEnum; // optional: use only if you want lock the referral search results to the targeted module 
  //---these two optional inputs must both be passed in together when the component is in context----
  @Input() referralItemType: ReferralItemTypeEnum;
  @Input() itemId: number;
  //--------------------------------------------------------------------------------------------------
  @Input() referralItemTypeReference: string; // optional item type reference, this is a free text field use only when you are in contect and want to pre-populate the referral item type reference

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  toggle = false;
  referral: Referral;

  constructor(
    public dialog: MatDialog,
    private readonly referralService: ReferralService
  ) { }

  setReferral($event: Referral) {
    if ($event) {
      this.isLoading$.next(true);
      this.referralService.getReferral($event.referralId).subscribe(result => {
        this.referral = result;
        this.toggleReferralDetails();
        this.isLoading$.next(false);
      });
    }
  }

  addReferral() {
    this.referral = new Referral();
    this.toggleReferralDetails();
  }

  cancel() {
    this.referral = null;
    this.toggleReferralDetails();
  }

  toggleReferralDetails() {
    this.toggle = !this.toggle;
  }

  openReferralReports() {
    const dialogRef = this.dialog.open(ReferralReportsDialogComponent, {
      width: '85%',
      height: 'auto',
      maxHeight: '95%',
      disableClose: true,
    });
  }

  openReferralNatureOfQuerySearchDialog() {
    const dialogRef = this.dialog.open(ReferralNatureOfQuerySearchDialogComponent, {
      width: '80%',
      disableClose: true,
      data: {
        targetModuleType: this.targetModuleType,
        isConfigurationMode: true
      }
    });
  }

}
