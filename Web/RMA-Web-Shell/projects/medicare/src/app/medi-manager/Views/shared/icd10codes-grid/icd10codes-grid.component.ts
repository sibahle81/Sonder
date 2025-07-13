import { Component, OnInit, Input } from '@angular/core';
import { PreAuthIcd10Code } from 'projects/medicare/src/app/medi-manager/models/preAuthIcd10Code';
import { PreAuthTreatmentBasket } from 'projects/medicare/src/app/preauth-manager/models/preauth-treatment-basket';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';


@Component({
  selector: 'icd10codes-grid',
  templateUrl: './icd10codes-grid.component.html',
  styleUrls: ['./icd10codes-grid.component.css'],
})
export class Icd10codesGridComponent implements OnInit {
  displayedColumns = ['icd10Code', 'bodySideId', 'injuryType', 'isClinicalUpdate', 'updateSequenceNo', 'authorizationCheck'];
  @Input() icd10Codes: Array<any>;
  @Input() type: string = 'normal';

  @Input() preAuthId: number;
  @Input() isHospitalAuth: boolean;
  existingICD10Records: PreAuthIcd10Code[];
  existingTreatmentBaskets: PreAuthTreatmentBasket[];
  bodySides: any[];
  injuryTypes = [];
  selectedICD10Codes: boolean = false;
  @Input() breakdowns: Array<PreAuthorisationBreakdown>;
  dataSource: Array<PreAuthorisationBreakdown>;    

  constructor(readonly mediCarePreAuthService: MediCarePreAuthService, private readonly lookupService: LookupService) { }

  ngOnInit() {
    this.loadData()
  }

  loadData(): void {
      this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthId).subscribe((data) => {
        if (data !== null) {
          this.existingICD10Records = data.preAuthIcd10Codes;
        }
      });
  }

  onChange(item: PreAuthIcd10Code) {    
  }
 
  getExistingICD10Codes(): PreAuthIcd10Code[] {
    if (this.existingICD10Records) {
      return this.existingICD10Records;
    }
  }
}
