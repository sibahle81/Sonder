import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';

import { Client } from '../../shared/Entities/client';
import { ClientDetailsBase } from './client-details.base';

import { ValidateIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number.validator';
import { ClientService } from '../../shared/services/client.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
    templateUrl: './client-group-individual.component.html',
    selector: 'client-group-individual'
})
export class ClientGroupIndividualComponent extends ClientDetailsBase implements OnInit {

    isIdandPassportInvalid: boolean;
    currentIdentity = '';
    currentPassport = '';
    parentClient = '';

    constructor(formBuilder: UntypedFormBuilder,
                private readonly clientService: ClientService,
                private readonly lookupService: LookupService) {
        super(formBuilder, 'Group Individual');
    }

    getSubHeading(): string {
        return `Group Client Name: ${this.parentClient}`;
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getCommunicationTypes();
    }

    getCommunicationTypes(): void {
        this.lookupService.getCommunicationTypes().subscribe(
            data => {
                this.communicationTypeList = data;
            });
    }

    createForm(): void {
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id: new UntypedFormControl(0),
            addressId: new UntypedFormControl(0),
            clientTypeId: new UntypedFormControl(1),
            leadClientId: new UntypedFormControl(0),
            firstName: new UntypedFormControl('', [Validators.required]),
            lastName: new UntypedFormControl('', [Validators.required]),
            idNumber: new UntypedFormControl('', [ValidateIdNumber]),
            passportNumber: new UntypedFormControl(''),
            dateOfBirth: new UntypedFormControl('', [Validators.required]),
            age: new UntypedFormControl({ value: '', disabled: true }),
            description: new UntypedFormControl(''),
            referenceNumber: new UntypedFormControl(''),
            communicationType: []
        });
    }

    readForm(): Client {
        const client = new Client();

        client.id = this.form.controls.id.value as number;
        client.addressId = this.form.controls.addressId.value as number;
        client.clientTypeId = this.form.controls.clientTypeId.value as number;
        client.leadClientId = this.form.controls.leadClientId.value as number;

        client.name = this.form.controls.firstName.value as string;
        client.lastName = this.form.controls.lastName.value as string;

        client.idNumber = this.form.controls.idNumber.value as string;
        client.passportNumber = this.form.controls.passportNumber.value as string;
        client.dateOfBirth = this.form.controls.dateOfBirth.value as Date;

        client.referenceNumber = this.form.controls.referenceNumber.value as string;
        client.description = this.form.controls.description.value as string;

        client.communicationTypeIds = this.getSelectedCommunicationTypes();
        return client;
    }

    setForm(client: Client): void {
        if (!this.form) { this.createForm(); }

        this.form.setValue({
            id: client.id,
            addressId: client.addressId,
            clientTypeId: client.clientTypeId,
            leadClientId: client.leadClientId ? client.leadClientId : 0,
            firstName: client.name ? client.name : '',
            lastName: client.lastName ? client.lastName : '',
            idNumber: client.idNumber,
            passportNumber: client.passportNumber ? client.passportNumber : '',
            dateOfBirth: client.dateOfBirth ? client.dateOfBirth : '',
            age: 0,
            description: client.description,
            referenceNumber : client.referenceNumber,
            communicationType: client.communicationTypeIds ? client.communicationTypeIds : []
        });

        this.setDateOfBirthIdNumberidNumber(client.idNumber);
        if (!this.isWizard) { this.disable(); }

        this.getParentClient(client.parentClientId);
    }

    getParentClient(clientId: number): any {
        this.clientService.getClient(clientId).subscribe(client => {
            this.parentClient = client.clientFullName;
        });
    }

    subscribeToIdNumberChange(): void {
        this.form.controls.idNumber.valueChanges
            .subscribe(idNumber => this.setDateOfBirthIdNumberidNumber(idNumber));
    }

    setDateOfBirthIdNumberidNumber(idNumber: string): void {
        if (!idNumber) { return; }

        if (idNumber != null && idNumber !== '') {
            this.form.patchValue({ age: '' });

            try {
                let year = Number(idNumber.substring(0, 2));
                if (year < 20) { year += 2000; } else { year += 1900; }

                const month = Number(idNumber.substring(2, 4));
                const day = Number(idNumber.substring(4, 6));

                const date = new Date(`${month}/${day}/${year}`);
                this.form.patchValue({ dateOfBirth: date });

                this.setAge(date);
            } catch (error) { }
        }
    }

    setAge(date: Date) {

        const timeDiff = Math.abs(Date.now() - +(new Date(date)));
        const clientAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);

        if (clientAge) {
            this.form.patchValue({ age: clientAge });
            this.form.controls.age.updateValueAndValidity();
        }
    }

    enable(): void {
        this.subscribeToIdNumberChange();
        this.form.enable();
        //this.form.controls.idNumber.disable();
        //this.form.controls.passportNumber.disable();
        this.form.controls.age.disable();
        //this.form.controls.dateOfBirth.disable();
    }

    setCurrentValues(): void {
        this.currentIdentity = this.form.controls.idNumber.value as string;
        this.currentPassport = this.form.controls.passportNumber.value as string;
    }
}
