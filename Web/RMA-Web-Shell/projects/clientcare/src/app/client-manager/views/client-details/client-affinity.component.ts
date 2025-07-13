import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';

import { Client } from '../../shared/Entities/client';
import { ClientDetailsBase } from './client-details.base';

import { GroupService } from '../../shared/services/group.service';
import { Group } from '../../shared/Entities/group';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
    templateUrl: './client-affinity.component.html',
    selector: 'client-affinity'
})
export class ClientAffinityComponent extends ClientDetailsBase implements OnInit {

    currentName = '';
    groups: Group[];
    groupId: number;


    constructor(
        formBuilder: UntypedFormBuilder,
        private readonly groupService: GroupService,
        private lookupService: LookupService) {
        super(formBuilder, 'Affinity');
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
            clientTypeId: new UntypedFormControl(1),
            leadClientId: new UntypedFormControl(0),
            group: new UntypedFormControl(''),
            name: new UntypedFormControl('', [Validators.required]),
            description: new UntypedFormControl(''),
            communicationType: []
        });
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
        client.referenceNumber = `Affinity - ${client.name}`;
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
            communicationType: client.communicationTypeIds ? client.communicationTypeIds : []
        });

        if (!this.isWizard) { this.disable(); }

    }

    setCurrentValues(): void {
        this.currentName = this.form.value.name.toLowerCase();
    }

    getGroups(): void {

        this.groupService.getGroups().subscribe(groups => {
            this.groups = groups;

        });
    }

    getSubHeading(): string {
        return null;
    }
}
