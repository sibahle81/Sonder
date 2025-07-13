import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';

import { Client } from '../../shared/Entities/client';
import { ClientDetailsBase } from './client-details.base';
import { GroupService } from '../../shared/services/group.service';
import { Group } from '../../shared/Entities/group';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { Observable } from 'rxjs';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';


@Component({
    templateUrl: './client-company.component.html',
    selector: 'client-company'
})
export class ClientCompanyComponent extends ClientDetailsBase implements OnInit {

    industryClasses: Lookup[];
    industries: Lookup[];
    sicCodes: Lookup[];
    groups: Group[];
    filteredSicCodesData: Observable<Lookup[]>;
    sicCodeName: string;
    currentName = '';
    currentRegistrationNumber = '';
    isUpdatingIndustries: boolean;
    isLoadingSicCodes: boolean;
    natureOfBusiness: string;
    groupId: number;



    constructor(
        formBuilder: UntypedFormBuilder,
        private readonly lookupService: LookupService,
        private readonly groupService: GroupService) {
        super(formBuilder, 'Company');
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.getGroups();
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
            clientTypeId: new UntypedFormControl(0),
            leadClientId: new UntypedFormControl(0),
            group: new UntypedFormControl(''),
            name: new UntypedFormControl('', [Validators.required]),
            description: new UntypedFormControl(''),
            registrationNumber: new UntypedFormControl('', [Validators.required]),
            referenceNumber: new UntypedFormControl(''),
            communicationType: []
        });
    }
    enable(): void {
        this.form.enable();
        this.form.controls.referenceNumber.disable();
    }


    readForm(): Client {
        const client = new Client();
        client.id = this.form.controls.id.value as number;
        client.addressId = this.form.controls.addressId.value as number;
        client.clientTypeId = this.form.controls.clientTypeId.value as number;
        client.leadClientId = this.form.controls.leadClientId.value as number;
        client.groupId = this.form.controls.group.value === 0 ? null : this.form.controls.group.value as number;
        client.name = this.form.controls.name.value as string;
        client.description = this.form.controls.description.value as string;
        client.industryId = 0;
        client.industryClassId = 0;
        client.registrationNumber = this.form.controls.registrationNumber.value as string;
        client.referenceNumber = this.form.controls.referenceNumber.value as string;
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
            group: client.groupId ? client.groupId : 0,
            name: client.name ? client.name : '',
            description: client.description ? client.description : '',
            registrationNumber: client.registrationNumber ? client.registrationNumber : '',
            referenceNumber: client.referenceNumber ? client.referenceNumber : '',
            communicationType: client.communicationTypeIds ? client.communicationTypeIds : []
        });

        this.setCurrentValues();
        if (!this.isWizard) { this.disable(); }
    }


    getGroups(): void {
        this.groupService.getGroups().subscribe(groups => {
            this.groups = groups;
        });
    }

    setCurrentValues(): void {
        this.currentName = this.form.value.name.toLowerCase();
        this.currentRegistrationNumber = this.form.value.registrationNumber.toLowerCase();
    }

    getSubHeading(): string {
        return null;
    }
}
