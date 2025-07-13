import { ChangeDetectorRef, Component, Input, Output, OnInit } from "@angular/core";
import { ClaimCareService } from "projects/claimcare/src/app/claim-manager/Services/claimcare.service";
import { EventModel } from "projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model";
import { PersonEventModel } from "projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model";
import { PensionClaim } from "projects/shared-components-lib/src/lib/models/pension-case.model";
import { UserService } from "projects/shared-services-lib/src/lib/services/security/user/user.service";
import { PensionerMedicalPlanService } from "../../services/pensioner-medical-plan-service";
import { Router } from "@angular/router";
import { PensionerInterviewForm } from "../../models/pensioner-interview-form-detail";
import { isNullOrUndefined } from "util";
import { PmpRegionTransfer } from "../../models/pmp-region-transfer";
import { CrudActionType } from "../../../shared/enums/crud-action-type";
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { PMPService } from "../../services/pmp-service";

@Component({
  selector: 'app-pensioner-medical-plan-viewer',
  templateUrl: './pensioner-medical-plan-viewer.component.html',
  styleUrls: ['./pensioner-medical-plan-viewer.component.css']
})
export class PensionerMedicalPlanViewerComponent implements OnInit {
  @Input() holisticPersonEventId: number;
  @Input() holisticClaimId: number;
  @Input() event: EventModel;

  @Input() title: string = 'Pensioner Region Transfer:';
  selectedPensionCase: PensionClaim;
  isLoading = false;
  personEventId: number;
  claimId: number;
  pmpRegionTransferId;
  pensionerInterviewFormId;
  selectedPersonEvent: PersonEventModel;
  selectedEvent: EventModel;
  pensionClaimData: PensionClaim;
  pensionerId: number;
  pensionCaseNumber: string;
  pensionerInterviewFormData: PensionerInterviewForm[]
  pmpRegionTransferData: PmpRegionTransfer[]
  showViewResults: boolean;

  constructor(private readonly eventService: ClaimCareService, 
    private pmpService: PMPService,
    private pensionerMedicalPlanService: PensionerMedicalPlanService,
    private readonly wizardService: WizardService,
    private readonly router: Router,
    private cdr: ChangeDetectorRef,
    public userService: UserService) {
  }

  ngOnInit() {
    if (this.holisticClaimId > 0)
    {
      this.searchPensionCase(this.holisticClaimId);
    }
    else {
      this.holisticClaimId = -1;
    }
  }

  searchPensionCase(claimId: number) {
    this.pmpService.searchPensionCase(' ', claimId).subscribe(result => {
      if (!String.isNullOrEmpty(result.pensionCaseNumber)) {
        this.pensionCaseSelected(result);
      }
    })
  }

  pensionCaseSelected(pensionClaim: PensionClaim) {
    this.showViewResults = true;
    this.selectedPensionCase = pensionClaim;
    this.getEvent(this.selectedPensionCase.personEventId)
    this.claimId = this.selectedPensionCase.claimId > 0 ? this.selectedPensionCase.claimId : 0;
    this.pensionerId = this.selectedPensionCase.pensionerId > 0 ? this.selectedPensionCase.pensionerId : 0;
    this.pensionCaseNumber = (!isNullOrUndefined(this.selectedPensionCase?.pensionCaseNumber) || !this.selectedPensionCase?.pensionCaseNumber || this.selectedPensionCase?.pensionCaseNumber === '') ? this.selectedPensionCase.pensionCaseNumber : '0';
    this.listInterviewForm();
    this.listInterRegionTransferForm();
  }

  getEvent(PersonEventIdParam) {
    if (PersonEventIdParam > 0) {
      this.isLoading = true;
      this.eventService.getPersonEventDetails(PersonEventIdParam).subscribe(result => {
        this.selectedEvent = result;
        this.personEventId = result.personEvents[0].personEventId;
        this.isLoading = false;
      })
    }
  }

  listInterRegionTransferForm() {
    this.pensionerMedicalPlanService.getPmpRegionTransferByClaimId(this.claimId).subscribe(
      data => {
        this.pmpRegionTransferData = data
      }
    );
  }

  listInterviewForm() {
    this.pensionerMedicalPlanService.getPensionerInterviewFormByPensionerId(this.pensionerId).subscribe(
      data => {
        this.pensionerInterviewFormData = data;
      }
    );
  }

  capturePMPSchedule() {    
    const startWizardRequest = new StartWizardRequest();
    let wizardModel = new PensionClaim();
    wizardModel.pensionCaseNumber = this.pensionCaseNumber;
    wizardModel.pensionerId = this.selectedPensionCase.pensionerId;
    wizardModel.pensionCaseNumber = this.selectedPensionCase.pensionCaseNumber;
    wizardModel.drg = this.selectedPensionCase.drg;
    wizardModel.icD10Driver = this.selectedPensionCase.icD10Driver;
    wizardModel.claimId = this.selectedPensionCase.claimId;
    wizardModel.personEventId = this.selectedPensionCase.personEventId;
    wizardModel.serviceName = this.selectedPensionCase.serviceName;
    wizardModel.scheduleDate = this.selectedPensionCase.scheduleDate;
    wizardModel.isScheduleON = this.selectedPensionCase.isScheduleON;
    wizardModel.attendedClinic = this.selectedPensionCase.attendedClinic;
    wizardModel.excludePMPSchedule = this.selectedPensionCase.excludePMPSchedule;
    wizardModel.pmpLocation = this.selectedPensionCase.pmpLocation;
    wizardModel.pmpRegion = this.selectedPensionCase.pmpRegion;
    wizardModel.pmpmca = this.selectedPensionCase.pmpmca;
    wizardModel.pmpspa = this.selectedPensionCase.pmpspa;
    wizardModel.tebaLocationId = this.selectedPensionCase.tebaLocationId;
    wizardModel.tebaBranchName = this.selectedPensionCase.tebaBranchName;
    wizardModel.tebaAddress = this.selectedPensionCase.tebaAddress;
    wizardModel.tebaCity = this.selectedPensionCase.tebaCity;
    wizardModel.tebaProvince = this.selectedPensionCase.tebaProvince;
    wizardModel.tebaCountry = this.selectedPensionCase.tebaCountry;
    wizardModel.tebaPostalCode = this.selectedPensionCase.tebaPostalCode;
    wizardModel.tebaPMPRegion = this.selectedPensionCase.tebaPMPRegion;
    wizardModel.tebaLocationDetails = this.selectedPensionCase.tebaLocationDetails;
    wizardModel.visits = this.selectedPensionCase.visits;

    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = 0;
    startWizardRequest.type = 'pmp-schedule';

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/pmp-schedule/continue/${wizard.id}`);
      })
  }

  captureInterRegionTransferForm() {
    this.pmpRegionTransferId = 0;
    this.router.navigate(['/medicare/pmp-manager/pensioner-inter-region-transfer/', this.pensionerId, this.pensionCaseNumber, this.claimId, this.pmpRegionTransferId, CrudActionType.create]);
  }

  captureInterviewForm() {
    this.pensionerInterviewFormId = 0;
    this.router.navigate(['/medicare/pmp-manager/pensioner-interview-form/', this.pensionerId, this.pensionCaseNumber, this.claimId, this.pensionerInterviewFormId, CrudActionType.create]);
  }

  onResearch(val: boolean) {
    if (val)
      this.showViewResults = false;
  }

}
