import { Component, Inject } from '@angular/core';
import { ClaimEstimate } from '../../../../entities/personEvent/claimEstimate';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HolisticClaimEstimatesComponent } from '../holistic-claim-estimates.component';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { ClaimEstimatePayoutBreakdown } from '../../../../entities/claim-estimate-payout-breakdown';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'claim-estimates-more-info',
  templateUrl: './claim-estimates-more-info.component.html',
  styleUrls: ['./claim-estimates-more-info.component.css']
})
export class ClaimEstimatesMoreInfoComponent {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  claimEstimate: ClaimEstimate;

  beneficiaries: RolePlayer[] = [];
  payoutBreakdowns: ClaimEstimatePayoutBreakdown[] = [];

  hasBreakdown = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HolisticClaimEstimatesComponent>,
    private claimCareService: ClaimCareService,
    public readonly rolePlayerService: RolePlayerService,
  ) {
    this.claimEstimate = this.data.claimEstimate;
    this.getBeneficiaries();

  }

  calculateAmount(value: number): string {
    return value > 0 ? this.formatMoney(value.toString()) : '0.00';
  }

  calculateOutstandingdays(): string {
    return `${(this.claimEstimate.estimatedDaysOff - this.claimEstimate.authorisedDaysOff)} day(s)`;
  }

  calculateOutstandingPd(): string {
    return `${(this.claimEstimate.estimatePd - this.claimEstimate.authorisedPd)}%`;
  }

  calculateOutstandingAmount(): string {
    const value = this.claimEstimate.estimatedValue - this.claimEstimate.authorisedValue;
    return value > 0 ? this.formatMoney(value.toString()) : '0.00';
  }

  cancel() {
    this.dialogRef.close(null);
  }

  getBeneficiaries() {
    this.isLoading$.next(true);

    this.beneficiaries = [];
    this.payoutBreakdowns = [];

    this.claimCareService.getPersonEvent(this.data.personEvent.personEventId).subscribe(result => {
      let beneficiaryIds = result.rolePlayer?.toRolePlayers?.map(a => a.fromRolePlayerId);
      if (beneficiaryIds?.length > 0) {
        this.rolePlayerService.getBeneficiaries(beneficiaryIds).subscribe(results => {
          this.beneficiaries = results;
          if (this.beneficiaries?.length > 0) {
            this.doPayoutBreakdowns();
          } else {
            this.isLoading$.next(false);
          }
        });
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  doPayoutBreakdowns() {
    switch (this.claimEstimate.estimateType) {
      case EstimateTypeEnum.FtlPenPrimry:
        this.showFatalPensionBreakdown();
        this.hasBreakdown = true;
        break;
      case EstimateTypeEnum.Sectn56:
        this.showSection56Breakdown();
        this.hasBreakdown = true;
        break;
      default:
        this.hasBreakdown = false;
        this.isLoading$.next(false);
    }
  }

  showFatalPensionBreakdown() {
    const totalPayable = this.claimEstimate.estimatedValue - this.claimEstimate.allocatedValue;
    this.payoutBreakdowns = [];

    const widows = this.beneficiaries.filter(
      b => b?.fromRolePlayers?.[0]?.rolePlayerTypeId === +BeneficiaryTypeEnum.Spouse
    );

    const children = this.beneficiaries.filter(b => {
      const roleId = b?.fromRolePlayers?.[0]?.rolePlayerTypeId;
      const isChild =
        roleId === +BeneficiaryTypeEnum.Child ||
        roleId === +BeneficiaryTypeEnum.Son ||
        roleId === +BeneficiaryTypeEnum.Daughter;

      return isChild && this.getAge(b?.person?.dateOfBirth) <= 18;
    });

    const widowCount = widows.length;
    const childCount = children.length;

    // Case 1: Only widows (no children)
    if (widowCount > 0 && childCount === 0) {
      const widowPayment = totalPayable / widowCount;
      widows.forEach(widow => {
        const payoutBreakdown = new ClaimEstimatePayoutBreakdown();
        payoutBreakdown.displayName = widow.displayName;
        payoutBreakdown.amount = widowPayment;
        payoutBreakdown.beneficiaryType = BeneficiaryTypeEnum.Spouse;
        payoutBreakdown.detail = `100% of ${this.formatMoney(totalPayable.toString())} divided by ${widowCount} spouse(s) = ${this.formatMoney(widowPayment.toString())}`;
        this.payoutBreakdowns.push(payoutBreakdown);
      });
    }

    // Case 2: Only children (no widows)
    else if (childCount > 0 && widowCount === 0) {
      const childPayment = totalPayable / childCount;
      children.forEach(child => {
        const payoutBreakdown = new ClaimEstimatePayoutBreakdown();
        payoutBreakdown.displayName = child.displayName + ' (age: ' + this.getAge(child.person.dateOfBirth) + ')';
        payoutBreakdown.amount = childPayment;
        payoutBreakdown.beneficiaryType = BeneficiaryTypeEnum.Child;
        payoutBreakdown.detail = `100% of ${this.formatMoney(totalPayable.toString())} divided by ${childCount} child(ren) = ${this.formatMoney(childPayment.toString())}`;
        this.payoutBreakdowns.push(payoutBreakdown);
      });
    }

    // Case 3: Both widows and children
    else if (widowCount > 0 && childCount > 0) {
      const widowPortion = totalPayable * 0.4;
      const childPortion = totalPayable * 0.6;

      const widowPayment = widowPortion / widowCount;
      const childPayment = childPortion / childCount;

      widows.forEach(widow => {
        const payoutBreakdown = new ClaimEstimatePayoutBreakdown();
        payoutBreakdown.displayName = widow.displayName;
        payoutBreakdown.amount = widowPayment;
        payoutBreakdown.beneficiaryType = BeneficiaryTypeEnum.Spouse;
        payoutBreakdown.detail = `40% of ${this.formatMoney(totalPayable.toString())} divided by ${widowCount} spouse(s) = ${this.formatMoney(widowPayment.toString())}`;
        this.payoutBreakdowns.push(payoutBreakdown);
      });

      children.forEach(child => {
        const payoutBreakdown = new ClaimEstimatePayoutBreakdown();
        payoutBreakdown.displayName = child.displayName + ' (age: ' + this.getAge(child.person.dateOfBirth) + ')';
        payoutBreakdown.amount = childPayment;
        payoutBreakdown.beneficiaryType = BeneficiaryTypeEnum.Child;
        payoutBreakdown.detail = `60% of ${this.formatMoney(totalPayable.toString())} divided by ${childCount} child(ren) = ${this.formatMoney(childPayment.toString())}`;
        this.payoutBreakdowns.push(payoutBreakdown);
      });
    }

    this.isLoading$.next(false);
  }

  showSection56Breakdown() {
    const totalPayable = this.claimEstimate.estimatedValue - this.claimEstimate.allocatedValue;
    this.payoutBreakdowns = [];

    const mainMember = this.beneficiaries.find(
      b => b?.fromRolePlayers?.[0]?.rolePlayerTypeId === +BeneficiaryTypeEnum.MainMember
    );

    if (mainMember) {
      const payoutBreakdown = new ClaimEstimatePayoutBreakdown();
      payoutBreakdown.displayName = mainMember.displayName;
      payoutBreakdown.amount = totalPayable;
      payoutBreakdown.beneficiaryType = BeneficiaryTypeEnum.MainMember;
      payoutBreakdown.detail = `100% of ${this.formatMoney(totalPayable.toString())} = ${this.formatMoney(totalPayable.toString())}`;
      this.payoutBreakdowns.push(payoutBreakdown);
    }

    this.isLoading$.next(false);
  }


  getAge(dob: Date): number {
    const birthday = new Date(dob);
    const timeDiff = Math.abs(Date.now() - birthday.getTime());
    return Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
  }

  getRelationName(beneficiaryType: BeneficiaryTypeEnum): string {
    return this.formatText(BeneficiaryTypeEnum[beneficiaryType]);
  }

  getEstimateType(estimateType: EstimateTypeEnum) {
    return this.formatText(EstimateTypeEnum[estimateType]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }

  formatMoney(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) { return '0.00'; }
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

