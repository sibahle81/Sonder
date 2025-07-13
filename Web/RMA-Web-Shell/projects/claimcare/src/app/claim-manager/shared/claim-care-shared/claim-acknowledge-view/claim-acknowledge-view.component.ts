import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';

@Component({
  selector: 'claim-acknowledge-view',
  templateUrl: './claim-acknowledge-view.component.html',
  styleUrls: ['./claim-acknowledge-view.component.css']
})
export class ClaimAcknowledgeViewComponent extends UnSubscribe implements OnInit {

  rolePlayerId: number;
  selectedPersonEvent: PersonEventModel;
  eventDate: Date;
  categoryInsured: CategoryInsuredEnum;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  selectedPolicies: Policy[] = [];
  isAugmentationOnly = false;
  isVapsDiseaseAcknowlegment = false;

  constructor(
    public dialogRef: MatDialogRef<ClaimAcknowledgeViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.rolePlayerId = this.data.rolePlayerId;
    this.selectedPersonEvent = this.data.personEvent;
    this.eventDate = new Date(this.data.eventDate);
    this.getCategoryInsured(this.data.categoryInsured);
    this.isLoading$.next(false);
  }

  getSelectedPolicies($event: Policy[]) {
    this.selectedPolicies = $event;
    this.isVapsDiseaseAcknowlegment = false;
    if (!this.validateVapsDisease()) {
      this.isVapsDiseaseAcknowlegment = true;
    }
  }

  getCategoryInsured(categoryInsured: boolean) {
    this.categoryInsured = categoryInsured ? CategoryInsuredEnum.Skilled
      : CategoryInsuredEnum.Unskilled;
  }

  save() {
    if (!this.validatePolicySelection()) {
      this.isAugmentationOnly = true;
      return;
    }


    this.dialogRef.close(this.selectedPolicies);
  }

  close() {
    this.dialogRef.close(null);
  }

  validatePolicySelection(): boolean {
    const hasCoid = this.selectedPolicies.some(p => p.productCategoryType == ProductCategoryTypeEnum.Coid);
    const hasAugmentation = this.selectedPolicies.some(p => p.productCategoryType == ProductCategoryTypeEnum.VapsAssistance);
    const hasNoneStatVaps = this.selectedPolicies.some(p => p.productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory);
    let isNotAugmentationOnlySelected;
    if ((hasAugmentation && hasCoid)) {
      isNotAugmentationOnlySelected = true;
    }
    else if ((hasAugmentation && hasNoneStatVaps)) {
      isNotAugmentationOnlySelected = true;
    }
    else if ((hasAugmentation && !hasNoneStatVaps) && (hasAugmentation && !hasCoid)) {
      isNotAugmentationOnlySelected = false;
    }
    else if (!hasAugmentation) {
      isNotAugmentationOnlySelected = true;
    }
    return isNotAugmentationOnlySelected;
  }

  validateVapsDisease(): boolean {
    if (this.selectedPersonEvent && this.selectedPersonEvent.claimType == ClaimTypeEnum.COIDDisease) {
      const hasNoneStatVaps = this.selectedPolicies.some(p => p.productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory)
      if (hasNoneStatVaps) {
        return false;
      }
    }
    return true;
  }
}
