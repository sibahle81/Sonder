import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';

import { Client } from '../../shared/Entities/client';
import { ClientDetailsBase } from './client-details.base';
import { ValidateIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number.validator';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { CommunicationTypeService } from '../../shared/services/communication-type.service';

@Component({
    templateUrl: './client-individual.component.html',
    selector: 'client-individual'
})
export class ClientIndividualComponent extends ClientDetailsBase implements OnInit {

    isIdandPassportInvalid: boolean;
    constructor(formBuilder: UntypedFormBuilder,
        private readonly communicationTypeService: CommunicationTypeService) {
        super(formBuilder, 'Individual');
    }

    currentIdentity = '';
    currentPassport = '';

    ngOnInit(): void {
        super.ngOnInit();
        this.getCommunicationTypes();
    }

    getCommunicationTypes(): void {
        this.communicationTypeService.getCommunicationTypes().subscribe(
            data => {
                this.communicationTypeList = data;
            });
    }

    createForm(): void {
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id: new UntypedFormControl(0),
            addressId: new UntypedFormControl(0),
            clientTypeId: new UntypedFormControl(0),
            leadClientId: new UntypedFormControl(0),

            firstName: new UntypedFormControl('', [Validators.required]),
            lastName: new UntypedFormControl('', [Validators.required]),

            // claimBranch: new FormControl('', [Validators.required]),
            // designation: new FormControl(''),

            idNumber: new UntypedFormControl('', [ValidateIdNumber]),
            passportNumber: new UntypedFormControl(''),
            dateOfBirth: new UntypedFormControl('', [Validators.required]),
            age: new UntypedFormControl({ value: '', disabled: true }),
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

        // client.claimBranchId = this.form.controls.claimBranch.value as number;
        // client.designation = this.form.controls.designation.value as string;

        client.idNumber = this.form.controls.idNumber.value as string;
        client.passportNumber = this.form.controls.passportNumber.value as string;
        client.dateOfBirth = this.form.controls.dateOfBirth.value as Date;

        client.referenceNumber = `Individual - ${client.name}`;
        client.description = `Individual - ${client.name}`;
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

            // claimBranch: client.claimBranchId ? client.claimBranchId : '',
            // designation: client.designation ? client.designation : '',


            idNumber: client.idNumber,
            passportNumber: client.passportNumber ? client.passportNumber : '',
            dateOfBirth: client.dateOfBirth ? client.dateOfBirth : '',
            age: 0,
            communicationType: client.communicationTypeIds ? client.communicationTypeIds : []
        });

        this.setDateOfBirthIdNumberidNumber(client.idNumber);
        if (!this.isWizard) { this.disable(); }
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


    getSubHeading(): string {
        return null;
    }
}
