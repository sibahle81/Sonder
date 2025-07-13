import { Component, OnInit, Input, ComponentFactoryResolver, ViewContainerRef, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { PreauthListComponent } from '../../../preauth-manager/views/preauth-list/preauth-list-component';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { MedicalInvoiceListComponent } from '../../../medical-invoice-manager/views/medical-invoice-list/medical-invoice-list.component';
import { MedicalReportSearchComponent } from 'projects/shared-components-lib/src/lib/searches/medical-report-search/medical-report-search.component';
import { TravelAuthListComponent } from '../../../preauth-manager/views/travel-auth-list/travel-auth-list.component';
import { HolisticViewInvoicesComponent } from '../../../medical-invoice-manager/views/holistic-view-invoices/holistic-view-invoices.component';
import { ProsthetistQuoteListComponent } from '../../../preauth-manager/views/prosthetist-quote-list/prosthetist-quote-list.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
    @Component({
    selector: 'medicare-view-results-generic-action-menu',
    templateUrl: './medicare-view-results-generic-action-menu.component.html',
    styleUrls: ['./medicare-view-results-generic-action-menu.component.css']
})
export class MedicareViewResultsGenericActionMenu implements OnInit, AfterViewInit, OnChanges {
    @Input() personEvent: PersonEventModel;
    @ViewChild('componentContainer', { read: ViewContainerRef }) componentContainer: ViewContainerRef;
    @Input() claimId: number = 0;
    @Input() preloadMedicalInvoices = false;
    @Input() searchedPreauthType: PreauthTypeEnum = PreauthTypeEnum.Unknown;
    @Input() selectedPreAuthId = 0;
    @Input() isWizard = false;
    isExternalUser = false;
    constructor(
        private readonly claimService: ClaimCareService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private readonly authService: AuthService,
    ) { }

    ngOnInit(): void {
        if (this.claimId == 0) {
            this.getClaim();
        }
        if(this.isWizard) {
            this.loadAuthorisations()        
        }
        this.isExternalUser = !this.authService.getCurrentUser().isInternalUser;
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges() {
        if (this.preloadMedicalInvoices) {
            this.getMedicalInvoices();
        }
        else {
            if (this.searchedPreauthType == PreauthTypeEnum.Hospitalization ||
                this.searchedPreauthType == PreauthTypeEnum.TreatingDoctor) {
                this.getHospitalAuthorisations();
            }
            else if (this.searchedPreauthType == PreauthTypeEnum.ChronicMedication) {
                this.getChronicAuthorisations();
            }
            else if (this.searchedPreauthType == PreauthTypeEnum.Treatment) {
                this.getTreatmentAuthorisations();
            }
            else if (this.searchedPreauthType == PreauthTypeEnum.Prosthetic) {
                this.getProstheticAuthorisations();
            }
            else if (this.searchedPreauthType == PreauthTypeEnum.TravelAuth)
            {
            this.getProstheticAuthorisations();
            }
        }
    }

    getClaim() {
        this.claimService.getPersonEventClaims(this.personEvent.personEventId).subscribe(result => {
            if (result && result.length > 0) {
                this.claimId = result[0].claimId;
            }
        })
    }

    loadComponent(componentType: any, parameters: any): void {
        if (this.componentContainer) {
            this.componentContainer.clear(); // Clear any existing component

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
            const componentRef = this.componentContainer.createComponent(componentFactory);
            const instance = componentRef.instance;

            // Pass parameters to the component instance
            Object.assign(instance, parameters);
        }
    }

    getHospitalAuthorisations() {
        const parameters = { claimId: this.claimId, searchByHealthCareProvider: true, preAuthType: PreauthTypeEnum.Hospitalization, header: 'Hospitalization', selectedPreAuthId: this.selectedPreAuthId, isWizard: this.isWizard };
        this.loadComponent(PreauthListComponent, parameters);
    }

    getTreatmentAuthorisations() {
        const parameters = { claimId: this.claimId, searchByHealthCareProvider: true, preAuthType: PreauthTypeEnum.Treatment, header: 'Treatment', selectedPreAuthId: this.selectedPreAuthId, isWizard: this.isWizard };
        this.loadComponent(PreauthListComponent, parameters);
    }

    getProstheticAuthorisations() {
        const parameters = { claimId: this.claimId, searchByHealthCareProvider: true, preAuthType: PreauthTypeEnum.Prosthetic, header: 'Prosthetic', selectedPreAuthId: this.selectedPreAuthId, isWizard: this.isWizard };
        this.loadComponent(PreauthListComponent, parameters);
    }

    getChronicAuthorisations() {
        const parameters = { claimId: this.claimId, searchByHealthCareProvider: true, preAuthType: PreauthTypeEnum.ChronicMedication, header: 'Chronic', selectedPreAuthId: this.selectedPreAuthId, isWizard: this.isWizard };
        this.loadComponent(PreauthListComponent, parameters);
    }

    getMedicalInvoices() {
        if (this.personEvent && this.personEvent.personEventId > 0) {
            const parameters = { personEventId: this.personEvent.personEventId, searchByHealthCareProvider: true };
            this.loadComponent(HolisticViewInvoicesComponent, parameters);
        }
    }

    getMedicalReports() {
        if (this.personEvent && this.personEvent.personEventId > 0) {
            const parameters = { claimId: this.claimId, searchByHealthCareProvider: true, triggerReset: false };
            this.loadComponent(MedicalReportSearchComponent, parameters);
        }
    }

    getProstheticQuoteList(){
        if (this.personEvent && this.personEvent.personEventId > 0) {
            const parameters = { claimId:this.claimId, personEventId:this.personEvent.personEventId, isCaptureMode: false };
            this.loadComponent(ProsthetistQuoteListComponent, parameters);
        }
    }

    loadAuthorisations() {
        if (this.preloadMedicalInvoices) {
            this.getMedicalInvoices();
        }
        else {
            if (this.searchedPreauthType == PreauthTypeEnum.Hospitalization ||
                this.searchedPreauthType == PreauthTypeEnum.TreatingDoctor) {
                this.getHospitalAuthorisations();
            }
            else if (this.searchedPreauthType == PreauthTypeEnum.ChronicMedication) {
                this.getChronicAuthorisations();
            }
            else if (this.searchedPreauthType == PreauthTypeEnum.Treatment) {
                this.getTreatmentAuthorisations();
            }
            else if (this.searchedPreauthType == PreauthTypeEnum.Prosthetic) {
                this.getProstheticAuthorisations();
            }
        }
    }

      getTravelAuthorisations() {
        const parameters = { personEventId: this.personEvent.personEventId, claimId: this.claimId, searchByHealthCareProvider: true, preAuthType : PreauthTypeEnum.TravelAuth, header : 'Travel', selectedPreAuthId: this.selectedPreAuthId };
        this.loadComponent(TravelAuthListComponent, parameters);
    }
}
