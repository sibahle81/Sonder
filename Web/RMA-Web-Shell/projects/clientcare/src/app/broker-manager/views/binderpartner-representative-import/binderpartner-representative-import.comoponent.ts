import { Brokerage } from './../../models/brokerage';
import { OnInit, Component, Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BrokerageService } from '../../services/brokerage.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BrokerageRepresentativeRequest } from '../../models/brokerage-representative-request';
import { BrokerageTypeEnum } from 'projects/shared-models-lib/src/lib/enums/brokerage-type-enum';

@Injectable()
@Component({
    templateUrl: './binderpartner-representative-import.component.html',
    styleUrls: ['./binderpartner-representative-import.component.css']
})
export class BinderPartnerRepresentativeImportComponent implements OnInit {
    form: UntypedFormGroup;
    fspNumber: string;
    brokerage: Brokerage;
    isLoading: boolean;
    representativeIdNumbers: string[] = [];
    hideFSPImport = true;

    constructor(
        private readonly formBuilder: UntypedFormBuilder,
        private readonly brokerageService: BrokerageService,
        private readonly privateAlertService: AlertService
    ) {
        this.isLoading = false;
        this.brokerage = new Brokerage();
    }

    ngOnInit(): void {
        this.createForm();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            fspNumber: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
            idNumber: ['', [Validators.minLength(13), Validators.maxLength(13)]],
        });
    }

    readForm(): string {
        const formModel = this.form.value;
        return formModel.query as string;
    }

    clearSearch(): void {
        this.form.patchValue({ query: '' });
        this.clear();
    }

    search() {
        this.clear();
        this.hideFSPImport = true;
        this.isLoading = true;
        this.fspNumber = this.form.get('fspNumber').value;
        this.brokerageService.getBrokerageAndRepresentativesByFSPNumber(this.fspNumber).subscribe(
            brokerage => {
                if (brokerage === undefined || brokerage === null) {
                    this.privateAlertService.error('Brokerage with FSP: ' + this.fspNumber + ' not found.', 'FSP Search');
                } else {
                    this.brokerage = brokerage;
                    this.hideFSPImport = false;
                }
                this.isLoading = false;
            },
            response => {
                this.isLoading = false;
                this.privateAlertService.error(response.error.Error, 'Brokerage FSP Search');
                this.isLoading = false;
            }
        );
    }

    submitFSPDataImportRequest() {
        this.hideFSPImport = true;
        this.isLoading = true;
        this.fspNumber = this.form.get('fspNumber').value;
        const request = new BrokerageRepresentativeRequest();
        request.fspNumber = this.fspNumber;
        request.representativeIdNumbers = this.representativeIdNumbers;
        request.BrokerageType = this.brokerage.brokerageType;

        this.brokerageService.submitFSPDataImportRequest(request).subscribe(
            result => {
                if (result === true) {
                    this.privateAlertService.success('Brokerage with FSP: ' + this.fspNumber + ' Import Request Submitted Successfully', 'FSP Import Request');
                    this.form.get('fspNumber').reset();
                } else {
                    this.privateAlertService.error('Brokerage with FSP: ' + this.fspNumber + ' Error Occured Submitting Import Request', 'FSP Import Request');
                    this.hideFSPImport = false;
                }
                this.isLoading = false;
            },
            response => {
                this.hideFSPImport = false;
                this.isLoading = false;
                this.privateAlertService.error(response.error.Error, 'FSP Import Request');
            }
        );

    }

    private clear() {
        this.brokerage = new Brokerage();
    }
    addIdNumber() {
        const idNumber = this.form.get('idNumber').value;
        if (idNumber !== null) {
            if (this.isLinked(idNumber)) {
                this.privateAlertService.error('Id Number: ' + idNumber + ' is already linked to Brokerage with FSP number: ' + this.fspNumber, 'Representative Import');
                return;
            }

            if (this.representativeIdNumbers.indexOf(idNumber) === -1 && idNumber.length > 4) {
                this.representativeIdNumbers.push(idNumber);
                this.form.get('idNumber').reset();
            }
        }
    }

    removeIdNumber(idNumber: string) {
        const position = this.representativeIdNumbers.indexOf(idNumber);
        this.representativeIdNumbers.splice(position, 1);
    }

    isLinked(idNumber: string) {
        let linked = false;
        this.brokerage.representatives.forEach((rep) => {
            if (rep && rep.idNumber === idNumber) {
                linked = true;
            }
        });
        return linked;
    }

    get validateFspNumberLength(): boolean {
        const fspNumber = this.form.get('fspNumber').value;
        return (fspNumber === undefined || fspNumber === null || fspNumber.length < 1);
    }

    get hasRepresentativeIdNumbers(): boolean {
        return (this.representativeIdNumbers === undefined || this.representativeIdNumbers === null || this.representativeIdNumbers.length === 0);
    }

}
