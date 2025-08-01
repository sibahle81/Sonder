import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { ItemType } from '../../shared/models/item-type.enum';
import { Wizard } from '../../shared/models/wizard';
import { WizardService } from '../../shared/services/wizard.service';

import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { LastModifiedByComponent } from '../../../last-modified-by/last-modified-by.component';
import { AuditLogComponent } from '../../../audit/audit-log.component';
import { NotesComponent } from '../../../notes/notes.component';
import { NotesRequest } from '../../../notes/notes-request';
import { AuditRequest } from '../../../audit/audit-models';

@Component({
    templateUrl: './wizard-details.component.html',
})
export class WizardDetailsComponent implements OnInit {
    @ViewChild(LastModifiedByComponent, { static: true }) lastModifiedByComponent: LastModifiedByComponent;
    @ViewChild(AuditLogComponent, { static: true }) auditLogComponent: AuditLogComponent;
    @ViewChild(NotesComponent, { static: true }) notesComponent: NotesComponent;

    form: UntypedFormGroup;
    hasCantApproveReason = false;

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly wizardService: WizardService,
        private readonly router: Router,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.createForm();
        this.activatedRoute.params.subscribe((params: any) => {
            this.loadingStart('Loading wizard details...');
            this.getWizard(params.id);
        });
    }

    createForm(): void {
        if (this.form) { return; }
        this.clearDisplayName();

        this.form = this.formBuilder.group({
            id: '',
            type: '',
            typeDisplay: '',
            typeDescription: '',
            name: '',
            currentStep: '',
            status: '',
            locked: '',
            canApprove: '',
            cantApproveReason: ''
        });
    }

    setForm(wizard: Wizard): void {
        if (!this.form) { this.createForm(); }

        let lockedReason: string;
        if (wizard.lockedReason && wizard.lockedReason !== '') {
            lockedReason = wizard.lockedReason;
        } else if (wizard.lockedToUserDisplayName === 'You') {
            lockedReason = 'Locked to you';
        } else {
            lockedReason = 'Unlocked';
        }

        this.form.setValue({
            id: wizard.id,
            type: wizard.type,
            typeDisplay: wizard.wizardConfiguration.displayName,
            typeDescription: wizard.wizardConfiguration.description,
            name: wizard.name,
            currentStep: wizard.currentStep,
            status: wizard.createdDate === wizard.modifiedDate ? 'New' : wizard.wizardStatusText,
            locked: lockedReason,
            canApprove: wizard.canApprove ? 'Yes' : 'No',
            cantApproveReason: wizard.cantApproveReason
        });

        this.hasCantApproveReason = wizard.cantApproveReason != null && wizard.cantApproveReason !== '';
        this.getDisplayNameByField(wizard.modifiedBy, wizard.modifiedDate);
        this.getNotes(wizard.id);
        this.getAuditDetails(wizard.id);
        this.form.disable();

        this.loadingStop();
    }

    getWizard(id: number): void {
        this.wizardService.getWizard(id).subscribe(wizard => this.setForm(wizard));
    }

    open(): void {
        const id = this.form.controls.id.value;
        const type = this.form.controls.type.value;

        Wizard.redirect(this.router, type, id);
    }

    back(): void {
        this.router.navigate(['/wizard-manager']);
    }

    loadingStart(message: string): void {
        this.appEventsManager.loadingStart(message);
    }

    loadingStop(): void {
        this.appEventsManager.loadingStop();
    }

    getDisplayName(baseClass: BaseClass): void {
        if (!this.lastModifiedByComponent) { return; }
        this.lastModifiedByComponent.getDisplayName(baseClass);
    }

    getDisplayNameByField(modifiedBy: string, modifiedDate: Date): void {
        if (!this.lastModifiedByComponent) { return; }
        this.lastModifiedByComponent.getDisplayNameByField(modifiedBy, modifiedDate);
    }

    clearDisplayName(): void {
        if (!this.lastModifiedByComponent) { return; }
        this.lastModifiedByComponent.clearDisplayName();
    }

    getAuditDetails(id: number): void {
        const auditRequest = new AuditRequest(ServiceTypeEnum.BusinessProcessManager, ItemType.Wizard, id);
        this.auditLogComponent.getData(auditRequest);
    }

    getNotes(id: number): void {
        const noteRequest = new NotesRequest(ServiceTypeEnum.BusinessProcessManager, 'Wizard', id);
        this.notesComponent.getData(noteRequest);
    }
}
