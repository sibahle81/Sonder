import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { ClaimDisabilityTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-disabiity-type-enum';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { Claim } from '../../entities/funeral/claim.model';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'claim-disability-container',
  templateUrl: './claim-disability-container.component.html',
  styleUrls: ['./claim-disability-container.component.css']
})
export class ClaimDisabilityContainerComponent implements OnInit {

  @Input() personEvent: PersonEventModel;
  @Input() selectedMedicalReport: FinalMedicalReportForm;
  @Input() claim: Claim;
  @Input() triggerRefresh: boolean;

  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() emitPensionerInterviewForm: EventEmitter<boolean> = new EventEmitter();

  currentUserLoggedIn: User;
  query: ClaimDisabilityTypeEnum;

  isDisabilityTypeSelected = false;
  isHearingTypeSelected = false;
  isPdLumpSumAwardTypeSelected = false;

  constructor(
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
  }

  disabilityTypeChange($event: ClaimDisabilityTypeEnum) {
    this.personEvent = {...this.personEvent};
    this.query = $event;

    // Reset
    this.isDisabilityTypeSelected = false;
    this.isHearingTypeSelected = false;
    this.isPdLumpSumAwardTypeSelected = false;

    const selectedType = +ClaimDisabilityTypeEnum[this.query];
    switch (selectedType) {
      case ClaimDisabilityTypeEnum.DisabilityAssessment:
        this.isDisabilityTypeSelected = true;
        break;
      case ClaimDisabilityTypeEnum.HearingAssessment:
        this.isHearingTypeSelected = true;
        break;
      case ClaimDisabilityTypeEnum.PDLumpAward:
        this.isPdLumpSumAwardTypeSelected = true;
        break;
    }
  }

  setPensionerInterview($event: boolean) {
    this.emitPensionerInterviewForm.emit($event);
  }
}
