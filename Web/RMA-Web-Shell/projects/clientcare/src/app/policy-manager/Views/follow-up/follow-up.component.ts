import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

// Reminder
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { FollowUp } from '../../shared/entities/follow-up';
import { ActionParameters } from '../../../client-manager/shared/Entities/action-parameters';
import { PolicyService } from '../../shared/Services/policy.service';
import { FollowUpService } from '../../shared/Services/follow-up.service';
import { BreadcrumbPolicyService } from '../../shared/Services/breadcrumb-policy.service';

@Component({
    templateUrl: './follow-up.component.html',
})
export class FollowUpDetailsComponent extends DetailsComponent implements OnInit {
    followUp: FollowUp;
    recipientTypes: Lookup[];
    users: Lookup[];
    policyId: number;
    hours: number;
    minutes: number;
    user: User;
    minDate = new Date();
    actionParameters: ActionParameters;
    validationRequest: string;
    itemId: number;
    reference: string;
    newAlertDate: Date;

    constructor(
        private readonly formBuilder: UntypedFormBuilder,
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly location: Location,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly followUpService: FollowUpService,
        private readonly lookupService: LookupService,
        private readonly policyService: PolicyService,
        private readonly authService: AuthService,
        private readonly breadcrumbService: BreadcrumbPolicyService
        ) {

        super(appEventsManager, alertService, router, 'FollowUP', '/policy-manager/', 2);
    }

    ngOnInit() {
        this.user = this.authService.getCurrentUser();
        this.breadcrumbService.setBreadcrumb('FollowUp Details');

        this.activatedRoute.params.subscribe((params: any) => {
            if (params.action === 'add') {
                this.actionParameters = new ActionParameters(params.id, params.action, params.selectedId, params.linkType);
                this.itemId = params.selectedId;
                this.createForm(0);
                this.getPolicydata(params.selectedId);
                this.breadcrumbService.setBreadcrumb('Add a followup');
            } else if (params.action === 'edit') {
                this.loadingStart('Loading follow up details...');
                this.actionParameters = new ActionParameters(params.selectedId, params.action, params.selectedId, params.linkType);
                this.createForm(params.selectedId);
                this.getFollowUp(params.selectedId);
                this.form.disable();
                this.breadcrumbService.setBreadcrumb('Edit a followup');
            } else {
                throw new Error(`Incorrect action was specified '${params.action}', expected was: add or edit`);
            }
        });
    }

    createForm(id: any): void {
        this.clearDisplayName();
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id,
            description: new UntypedFormControl('', [Validators.required]),
            alertDate: new UntypedFormControl(null, [Validators.required]),
            minutes: new UntypedFormControl('', [Validators.required]),
            hours: new UntypedFormControl('', [Validators.required])
        });
    }

    readForm(): FollowUp {
        const formModel = this.form.value;
        const followUp = new FollowUp();
        followUp.id = formModel.id as number;
        followUp.description = formModel.description as string;
        followUp.alertDate = formModel.alertDate as Date;
        followUp.hours = formModel.hours as number;
        followUp.minutes = formModel.minutes as number;

        return followUp;
    }

    setForm(followUp: FollowUp): void {
        if (!this.form) { this.createForm(followUp.id); }
        const date = new Date(followUp.alertDate);
        this.form.setValue({
            id: followUp.id,
            description: followUp.description,
            alertDate: followUp.alertDate,
            minutes: date.getMinutes().toString(),
            hours: date.getHours().toString()
        });
        this.newAlertDate = followUp.alertDate;
        this.getDisplayName(followUp);
    }

    hourChange(value: number) {
        this.hours = this.form.get('hours').value as number;
        this.validationRequest = 'hours';
        this.validateTime();
    }

    minuteChange(value: number) {
        this.minutes = this.form.get('minutes').value as number;
        this.validationRequest = 'minutes';
        this.validateTime();
    }

    validateDates(): void {
        this.validateTime();
    }

    getFollowUp(id: number): void {
        this.followUpService.getFollowUp(id)
            .subscribe(followUp => {
                this.setForm(followUp);
                this.loadingStop();
                this.form.disable();
            });
    }

    getPolicydata(id: number): any {
        this.policyService.getPolicy(id)
            .subscribe(policy => {
                this.reference = policy.policyNumber;

            });
    }

    validateTime(): void {
        const hours = this.form.get('hours').value as number;
        const minutes = this.form.get('minutes').value as number;

        if (hours == null || minutes == null) { return; }

        const currentDate = new Date();
        const alertDate = this.form.get('alertDate').value as Date;

        if (alertDate == null) {
            this.form.get('alertDate').setErrors({ required: true });
            return;
        }

        const current = new Date();
        current.setHours(currentDate.getHours());
        current.setMinutes(currentDate.getMinutes());

        const newDate = new Date(alertDate);

        newDate.setMinutes(minutes);
        newDate.setHours(hours);

        if (new Date(newDate) < current) {
            if (this.validationRequest === 'hours') {
                this.form.get('hours').setErrors({ min: true });

                this.form.get('minutes').setErrors(null);
                this.form.get('minutes').updateValueAndValidity();
            } else if (this.validationRequest === 'minutes') {
                this.form.get('minutes').setErrors({ min: true });

                this.form.get('hours').setErrors(null);
                this.form.get('hours').updateValueAndValidity();
            }
        } else {
            this.form.get('hours').setErrors(null);
            this.form.get('hours').updateValueAndValidity();

            this.form.get('minutes').setErrors(null);
            this.form.get('minutes').updateValueAndValidity();
        }
    }

    save(): void {
       if (this.form.invalid) { return; }

       const followUp = this.readForm();
       this.form.disable();
       this.loadingStart('Saving new follow up...');
       if (this.itemId) { followUp.reference = this.getPolicydata(this.itemId); }

       if (this.newAlertDate !== followUp.alertDate) {
           followUp.alertDate = new Date(followUp.alertDate.setDate(followUp.alertDate.getDate() + 1));
        }

       if (followUp.id > 0) {
            this.editFollowUp(followUp);
        } else {
            followUp.name = this.user.name;
            followUp.email = this.user.email;
            this.addFollowUp(followUp);
        }
    }

    editFollowUp(followUp: FollowUp): void {
        this.followUpService.editFollowUp(followUp)
            .subscribe(() => this.isDone());
    }

    addFollowUp(followUp: FollowUp): void {
        followUp.itemId = this.itemId;
        followUp.itemType = 'Policy';
        followUp.reference = this.reference;
        this.followUpService.addFollowUp(followUp).subscribe(() => this.isDone());
    }

    isDone(): void {
        this.appEventsManager.loadingStop();
        this.alertService.success('Follow up was saved successfully', 'Follow up', true);
        this.location.back();
    }

    setCurrentValues(): void {

    }

    back(): void {
        this.location.back();
    }
}
