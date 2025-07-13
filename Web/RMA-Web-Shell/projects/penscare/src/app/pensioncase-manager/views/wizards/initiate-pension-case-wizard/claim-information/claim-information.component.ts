import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { PensionProductOptionsEnum } from 'projects/shared-models-lib/src/lib/enums/pension-product-options-enum';
import { MatDialog } from '@angular/material/dialog';
import { DeathDetailsDialogComponent } from 'projects/penscare/src/app/shared-penscare/views/death-details-dialog/death-details-dialog.component';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { DatePipe } from '@angular/common';
import { PersonEventDeathDetailModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEventDeathDetail.model';
import { DeathTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/deathType.enum';

@Component({
  selector: 'app-claim-information',
  templateUrl: './claim-information.component.html',
  styleUrls: ['./claim-information.component.css']
})
export class ClaimInformationComponent implements OnInit {

  @Input() selectedClaim: PensionClaim
  @Output() onViewClaims = new EventEmitter<any>();
  form: UntypedFormGroup;
  public genders: Lookup[] = [];
  public benefitTypes: Lookup[] = [];
  personEvent : PersonEventModel;

  @ViewChild('benefitTypeElement', { static: false }) benefitTypeElement: ElementRef;
  filteredBenefitTypes: Lookup[];

  constructor(
    private pensCareService: PensCareService,
    private readonly formBuilder: UntypedFormBuilder, private dialog: MatDialog,
    private claimService: ClaimCareService, 
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.createForm();
    this.getPersonEvent();
    this.getLookups();   
  }

  getLookups() {
    const lookups = this.pensCareService.getPensCareLookupsCache();
    if (lookups) {
      this.genders = lookups.genders;
      this.benefitTypes = lookups.benefitTypes;
    }
  };

  createForm(): void {
    if (this.form) {
      return
    }
    this.form = this.formBuilder.group({
      claimReferenceNumber: new UntypedFormControl({ value: this.selectedClaim.claimReferenceNumber, disabled: true }),
      dateOfAccident: new UntypedFormControl({ value: this.selectedClaim.dateOfAccident, disabled: true }),
      dateOfStabilisation: new UntypedFormControl({ value: this.selectedClaim.dateOfStabilisation, disabled: true }),
      earnings: new UntypedFormControl({ value: this.selectedClaim.earnings, disabled: true }),
      pensionLumpSum: new UntypedFormControl({ value: this.selectedClaim.pensionLumpSum, disabled: true }),
      estimatedCV: new UntypedFormControl({ value: this.selectedClaim.estimatedCV, disabled: true }),
      verifiedCV: new UntypedFormControl({ value: this.selectedClaim.verifiedCV, disabled: true }),
      widowLumpSum: new UntypedFormControl({ value: this.selectedClaim.widowLumpSum, disabled: true }),
      productCode: new UntypedFormControl({ value: this.selectedClaim.productCode, disabled: true }),
      percentageIncrease: new UntypedFormControl({ value: this.selectedClaim.percentageIncrease, disabled: true }),
      icd10Driver: new UntypedFormControl({ value: this.selectedClaim.icD10Driver, disabled: true }),
      drg: new UntypedFormControl({ value: this.selectedClaim.drg, disabled: true }),
      member: new UntypedFormControl({ value: this.selectedClaim.member, disabled: true }),
      deathDate: new UntypedFormControl({ value: null, disabled: true })
    });
  }

  viewClaims() {
    this.onViewClaims.emit();
  }

  addDeathDetails() {
    const dialogRef = this.dialog.open(DeathDetailsDialogComponent, {
      width: "50%",
      data: { personEventId: this.selectedClaim.personEventId }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const dateFormatted = this.datePipe.transform(result.deathDate, 'yyyy-MM-dd')
        this.form.get('deathDate').setValue(dateFormatted);
        if (this.personEvent.personEventDeathDetail) {
          this.personEvent.personEventDeathDetail.deathDate =  new Date(result.deathDate).getCorrectUCTDate();
          this.personEvent.personEventDeathDetail.deathType = DeathTypeEnum.Default;
        }
        else {
          this.personEvent.personEventDeathDetail = new PersonEventDeathDetailModel();
          this.personEvent.personEventDeathDetail.deathDate =  new Date(result.deathDate).getCorrectUCTDate();
          this.personEvent.personEventDeathDetail.deathType = DeathTypeEnum.Default;
        }

        this.claimService.createDisabiltyToFatalDeathCaptured(this.personEvent).subscribe();
      };
    });
  }  

  getPersonEvent(){
    this.claimService.getPersonEvent(this.selectedClaim.personEventId).subscribe(result => {     
      this.personEvent = result;

      if (this.personEvent?.personEventDeathDetail?.deathDate) {
        const dateFormatted = this.datePipe.transform(this.personEvent.personEventDeathDetail.deathDate, 'yyyy-MM-dd')
        this.form.get('deathDate').setValue(dateFormatted);
      }
    })
  }
}
