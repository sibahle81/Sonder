import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InformantComponent } from '../funeral/informant/informant.component';
import { ForensicPathologistComponent } from '../funeral/forensic-pathologist/forensic-pathologist.component';
import { AdditionalRegistryDetailsComponent } from '../funeral/additional-registry-details/additional-registry-details.component';
import { MedicalPractitionerComponent } from '../funeral/medical-practitioner/medical-practitioner.component';
import { FuneralParlorComponent } from '../funeral/funeral-parlor/funeral-parlor.component';
import { UndertakerComponent } from '../funeral/undertaker/undertaker.component';
import { BodyCollectionComponent } from '../funeral/body-collection/body-collection.component';
import { ClaimCareService } from '../../Services/claimcare.service';
import { ClaimDetailsComponent } from '../claim-details/claim-details.component';
import { ClaimantComponent } from '../funeral/claimant/claimant.component';

@Component({
  selector: 'app-claim-view',
  templateUrl: './claim-view.component.html'
})

export class ClaimViewComponent implements OnInit {

  @ViewChild(ClaimDetailsComponent, { static: true }) claimDetailsComponent: ClaimDetailsComponent;
  @ViewChild(AdditionalRegistryDetailsComponent, { static: true }) additionalRegistryDetails: AdditionalRegistryDetailsComponent;
  @ViewChild(ClaimantComponent, { static: true }) ClaimantComponent: ClaimantComponent;
  @ViewChild(InformantComponent, { static: true }) Informant: InformantComponent;
  @ViewChild(MedicalPractitionerComponent, { static: true }) MedicalPractitioner: MedicalPractitionerComponent;
  @ViewChild(ForensicPathologistComponent, { static: true }) ForensicPathologist: ForensicPathologistComponent;
  @ViewChild(FuneralParlorComponent, { static: true }) funeralParlor: FuneralParlorComponent;
  @ViewChild(UndertakerComponent, { static: true }) undertaker: UndertakerComponent;
  @ViewChild(BodyCollectionComponent, { static: true }) bodyCollection: BodyCollectionComponent;

  isLoading: boolean;
  policyId: number;
  personEventId: number;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly claimService: ClaimCareService
  ) {
  }

  ngOnInit() {
    this.isLoading = true;

    this.activatedRoute.params.subscribe((params: any) => {
      this.personEventId = params.personEventId;
      this.policyId = params.policyId;
      if (params.personEventId !== '' && params.policyId !== '') {
        this.claimService.getPersonEventByPolicyId(params.personEventId, params.policyId).subscribe(result => {
          result.claimPolicyId = this.policyId;
          this.claimDetailsComponent.setViewData(result, false);
          this.additionalRegistryDetails.setViewData(result, false);
          this.ClaimantComponent.setViewData(result, false);
          this.Informant.setViewData(result, false);
          this.MedicalPractitioner.setViewData(result, false);
          this.ForensicPathologist.setViewData(result, false);
          this.funeralParlor.setViewData(result, false);
          this.undertaker.setViewData(result, false);
          this.bodyCollection.setViewData(result, false);
          this.isLoading = false;
        });
      }
    });
  }
}
