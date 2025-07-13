
import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { TariffSearch } from 'projects/medicare/src/app/preauth-manager/models/tariff-search';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';

@Component({
    selector: 'tariff-search',
    templateUrl: './tariff-search.component.html',
    styleUrls: ['./tariff-search.component.css'],
})

export class TariffSearchComponent implements OnInit {
    @Input() tariffSearchType: string;
    @Input() tariffTypeIds: string;
    @Input() preAuthFromDate: Date;
    @Input() practitionerTypeId: number;
    @Input() practitionerName: string = '';
    @Input() hideTariffAmount: boolean = false;
    @Output() tariffSearchResults: EventEmitter<TariffSearch> = new EventEmitter<TariffSearch>();
    
    @ViewChild('tariffModal',{static:false}) modal: ElementRef;

    public form: UntypedFormGroup;
    showSearchProgress = false;
    tariffSearchErrorMessage: string;
    disabled: boolean = true;
    tariffSearch: TariffSearch;
    isLoadingCategories = false;
    claimNumberErrorMessage: string;
    today = new Date();
    claimDetail: PreAuthClaimDetail;
    healthCareProviderId: number;
    isValidTariff = false;
    isAdmissionCode: boolean = false;
    isModifier: boolean = false;
    isFullDayAlways: boolean = false;
    levelOfCareId: number;
    
    tariffId: number;
    medicalItemId: number;
    tariffCode: string;
    tariffType: string;
    tariffDescription: string;
    practitionerType: string;
    defaultQuantity: number;
    tariffAmount: number;
    isTariffSearch:boolean = false;
    isInternalUser: boolean = true;

    constructor(
        appEventsManager: AppEventsManager,
        private readonly authService: AuthService,
        activatedRoute: ActivatedRoute,
        private readonly datePipe: DatePipe,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly mediCarePreAuthService: MediCarePreAuthService,
        private readonly medicalInvoiceService: MedicalInvoiceService,
        private readonly alertService: AlertService,
        private readonly preauthBreakdownComponent: PreauthBreakdownComponent,
        readonly confirmservice: ConfirmationDialogsService,
    ) {

    }

    ngOnInit(): void {        
        var currentUser = this.authService.getCurrentUser();
        this.isInternalUser = currentUser.isInternalUser;
        this.createForm();       
    }

    ngOnChanges(changes: SimpleChanges) {
        if(!changes?.preAuthFromDate?.firstChange && changes?.preAuthFromDate?.currentValue)
        {
            this.form.get('itemCode').enable();
        }
    }

    onLoadLookups(): void {

    }

    populateForm(): void {

    }

    search(): void {
        
        if (this.preAuthFromDate) {
            if (this.tariffTypeIds) {
                this.showSearchProgress = true;
                let itemCode = this.form.get("itemCode").value;

                this.mediCarePreAuthService.checkAdmissionCode(itemCode,this.practitionerTypeId).subscribe((res) => {
                    this.isAdmissionCode = res.levelOfCareId != null ? true : false;
                    this.isFullDayAlways = res.isFullDayAlways;
                    this.levelOfCareId = res.levelOfCareId;
                });
                
                this.mediCarePreAuthService.searchTariff(itemCode, this.tariffTypeIds, this.practitionerTypeId, this.datePipe.transform(this.preAuthFromDate, 'yyyy-MM-dd')).subscribe((res) => {
                  
                    this.tariffSearchResults.emit(res);
                    if (res.tariffId > 0) {
                        this.tariffSearchErrorMessage = undefined;
                        this.isValidTariff = true;
                        const form = this.form.controls;
                        this.tariffCode = res.tariffCode;
                        this.tariffDescription = res.tariffDescription;
                        this.tariffType = res.tariffType;
                        this.practitionerType = res.practitionerType;
                        this.defaultQuantity = res.defaultQuantity;
                        this.tariffAmount = res.tariffAmount;
                        this.tariffId = res.tariffId;
                        this.medicalItemId = res.medicalItemId;

                        //Below, set TariffSearch item to be used in PreAuth Breakdown component
                        this.tariffSearch = new TariffSearch();
                        this.tariffSearch.tariffId = res.tariffId;
                        this.tariffSearch.tariffCode = res.tariffCode;
                        this.tariffSearch.tariffDescription = res.tariffDescription;
                        this.tariffSearch.defaultQuantity = res.defaultQuantity;
                        this.tariffSearch.tariffAmount = res.tariffAmount;
                        this.tariffSearch.tariffTypeId = res.tariffTypeId;
                        this.tariffSearch.tariffType = res.tariffType;
                        this.tariffSearch.practitionerTypeId = res.practitionerTypeId;
                        this.tariffSearch.practitionerType = res.practitionerType;
                        this.tariffSearch.medicalItemId = res.medicalItemId;
                        this.tariffSearch.isFullDayAlways = this.isFullDayAlways;
                        this.tariffSearch.isAdmissionCode = this.isAdmissionCode;
                        this.tariffSearch.isModifier = this.isModifier;
                        this.tariffSearch.levelOfCareId = this.levelOfCareId;
                        this.tariffSearch.tariffBaseUnitCostTypeId = res.tariffBaseUnitCostTypeId;
                        form.itemCode.setValue('');
                        
                    }
                    else {
                        this.tariffSearchErrorMessage = 'Invalid tariff, please capture correct item code.';
                        this.isValidTariff = false;
                        this.clearForm();
                    }
                    this.showSearchProgress = false;
                });
            }
            else {
                this.tariffSearchErrorMessage = 'Invalid tariffTypeId, please capture Claim and HealthCare Provider details.';
                this.clearForm();
            }
        }
        else {
            this.confirmservice.confirmWithoutContainer('Date Validation', `Please select date From.`,
            'Center', 'Center', 'OK').subscribe(result => {
    
            });
        }
    }

    populateModel(): void {

    }

    createForm(): void {
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            itemCode: new UntypedFormControl({value: '', disabled: false}),            
        });
    }

    clearForm(): void {
        this.form.patchValue({
            itemCode: ''
        });
        this.tariffCode = '';
        this.tariffDescription = '';
        this.tariffId = 0;
        this.medicalItemId = 0;
        this.tariffType = '';
        this.practitionerType = '';
        this.defaultQuantity = 0;
        this.tariffAmount = 0;
        this.isValidTariff = false;
    }

    tariffCodeSearch(): void{
        this.modal.nativeElement.style.display = 'block';
        this.isTariffSearch = true;
    }

    onTariffSearchClose(event): void{
        this.modal.nativeElement.style.display = 'none';
        this.isTariffSearch = false;
    }

    onTariffSelect(event): void{  
        let tariffItem = event;     
        this.modal.nativeElement.style.display = 'none';
        this.isTariffSearch = false;
        this.isValidTariff = true;
        
        this.tariffCode = tariffItem.tariffCode;
        this.tariffDescription = tariffItem.tariffDescription;
        this.tariffType = tariffItem.tariffType;
        this.practitionerType = tariffItem.practitionerType;
        this.defaultQuantity = tariffItem.defaultQuantity;
        this.tariffAmount = tariffItem.tariffAmount;
        this.tariffId = tariffItem.tariffId;
        this.medicalItemId = tariffItem.medicalItemId;
        this.form.patchValue({itemCode: this.tariffCode });
        this.tariffSearchResults.emit(event);
    }

}


