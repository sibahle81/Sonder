import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Component, NgModule, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { TariffSearch } from 'projects/medicare/src/app/preauth-manager/models/tariff-search';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { CrosswalkSearch } from 'projects/medicare/src/app/medi-manager/models/crosswalk-search';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';


@Component({
  selector: 'preauth-review-breakdown',
  templateUrl: './preauth-review-breakdown.component.html',
  styleUrls: ['./preauth-review-breakdown.component.css'],
})

export class PreAuthReviewBreakdownComponent implements OnInit {

  public form: UntypedFormGroup;
  tariffSearchCurrent: TariffSearch;
  crosswalkSearchCurrent: CrosswalkSearch[];
  existingpreAuthBreakdownList: PreAuthorisationBreakdown[];
  dataSource: MatTableDataSource<PreAuthorisationBreakdown>;
  @Input() healthCareProvider: HealthCareProvider;
  @Input() preAuthBreakdownType: string;
  @Input() preAuthClaimDetail: PreAuthClaimDetail;
  @Input() showLevelOfCare: boolean = true;
  @Input() tariffSearchType: string;
  @Input() preAuthId: number;
  @Input() healthCareProviderId: number;
  @Output() dateChange: EventEmitter<MatDatepickerInputEvent<Date>>;
  private preauthBreakdown: PreauthBreakdownComponent;
  showPreAuthBreakdownComponent: boolean = false;
  review: boolean = true;
  @Input() authType: string; 

  constructor(
    public datepipe: DatePipe,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private changeDetector : ChangeDetectorRef) {
        
  }

  onLoadLookups(): void {
  }

  ngOnInit() {
    this.getExistingPreAuthBreakdownList();
  }

  getExistingPreAuthBreakdownList(): void {
    this.existingpreAuthBreakdownList = [];
    if (this.preAuthId > 0) {
        this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthId).subscribe((data) => {
          if (data !== null) {
            let result = data as PreAuthorisation;
            this.existingpreAuthBreakdownList = result.preAuthorisationBreakdowns;          
          }
        });
      }
  }

  getReviewPreAuthBreakdownList(): PreAuthorisationBreakdown[] {
    return this.preauthBreakdown.getReviewedPreAuthBreakdownList();
  }

  getHealthCareProvider(healthCareProviderId: number): void {
    if (healthCareProviderId > 0) {
        this.healthcareProviderService.getHealthCareProviderById(healthCareProviderId).subscribe((result) => {
          if (result !== null && result.rolePlayerId > 0) {
            this.healthCareProvider = result;
          }
        });
      }
}

  @ViewChild('preauthBreakdown', { static: false }) set content(content: PreauthBreakdownComponent) {
    if(content) { 
         this.preauthBreakdown = content;
         this.preauthBreakdown.loadData(this.existingpreAuthBreakdownList);
    }
 }

  
  showPreAuthBreakdown(): void {
    this.showPreAuthBreakdownComponent = true;
      this.changeDetector.detectChanges();
  }
}

