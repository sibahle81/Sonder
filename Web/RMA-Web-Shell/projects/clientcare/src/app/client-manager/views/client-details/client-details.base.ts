import { OnInit, Directive } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

import { Client } from '../../shared/Entities/client';
import { CommunicationType } from '../../shared/Entities/communication-type';
import { ClaimBranch } from '../../shared/Entities/claim-branch';

@Directive()
export abstract class ClientDetailsBase implements OnInit {
    form: UntypedFormGroup;
    claimBranches: ClaimBranch[];
    isWizard: boolean;
    communicationTypeList: CommunicationType[];
    protected constructor(
        protected readonly formBuilder: UntypedFormBuilder,
        readonly name: string) {
    }

    ngOnInit(): void {
        this.createForm();
    }

    /** @description Create the angular form on the component. */
    abstract createForm(): void;

    /** @description Reads the data from the angular form and returns the model. */
    abstract readForm(): Client;

    abstract setCurrentValues(): void;

    /**
     * @description Populate the form with the client data.
     * @param {any} item The model that will populate the form.
    */
    abstract setForm(client: Client): void;

    setClaimBranches(claimBranches: ClaimBranch[]): void {
        this.claimBranches = claimBranches;
    }

    /** @description Gets the validation status of the component. */
    validate(): boolean {
        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.get(key);
            control.markAsTouched();
            control.updateValueAndValidity();
        });
        return this.form.valid;
    }

    disable(): void {
        this.form.disable();
    }

    enable(): void {
        this.form.enable();
    }

    abstract getSubHeading(): string;

    getSelectedCommunicationTypes(): number[] {
        const ids: number[] = [];
        const selectedIds = this.form.controls.communicationType.value ? this.form.controls.communicationType.value.length : 0;
        for (let i = 0; i < selectedIds; i++) {
            ids.push(this.form.controls.communicationType.value[i]);
        }
        return ids;
    }


}
