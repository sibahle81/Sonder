import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { Campaign } from '../../shared/entities/campaign';
import { CampaignReminder } from '../../shared/entities/campaign-reminder';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CampaignReminderService } from '../../shared/services/campaign-reminder.service';

@Component({
    styleUrls: ['./campaign-reminder.component.css'],
    templateUrl: './campaign-reminder.component.html',
// tslint:disable-next-line: component-selector
    selector: 'campaign-reminder'
})
export class CampaignReminderComponent extends DetailsComponent implements OnInit {

    campaign: Campaign;
    currentUser: string;
    reminder: CampaignReminder;
    isLoading = false;

    hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    get hasCampaign(): boolean {
        if (this.isLoading) { return false; }
        if (!this.campaign) { return false; }
        return this.campaign.id > 0;
    }

    get hasDateError(): boolean {
        if (this.form.pristine) { return false; }
        const date = this.form.get('reminderDate');
        if (date.untouched) { return false; }
        if (date.hasError('required')) { return true; }
        return false;
    }

    get hasTimeError(): boolean {
        if (this.form.pristine) { return false; }
        const hour = this.form.get('reminderHour');
        const minute = this.form.get('reminderMinute');
        if (hour.untouched && minute.untouched) { return false; }
        if (hour.hasError('required')) { return true; }
        if (minute.hasError('required')) { return true; }
        return false;
    }

    constructor(
        router: Router,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly alertService: AlertService,
        private readonly authService: AuthService,
        appEventsManager: AppEventsManager,
        private readonly reminderService: CampaignReminderService
    ) {
        super(appEventsManager, alertService, router, '', '', 1);
    }

    ngOnInit(): void {
        this.createForm();
        this.currentUser = this.authService.getUserEmail().toLowerCase();
        this.canEdit = false;
    }

    createForm(): void {
        this.form = this.formBuilder.group(
            {
                id: 0,
                campaignId: 0,
                reminderDate: new UntypedFormControl('', [Validators.required]),
                reminderHour: new UntypedFormControl('', [Validators.required]),
                reminderMinute: new UntypedFormControl('', [Validators.required]),
                reminderActive: new UntypedFormControl('')
            }
        );
    }

    setForm(reminder: CampaignReminder): void {
        const date = new Date(reminder.reminderDate);
        this.form.setValue(
            {
                id: reminder.id,
                campaignId: reminder.campaignId,
                reminderDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                reminderHour: date.getHours() as number,
                reminderMinute: date.getMinutes() as number,
                reminderActive: reminder.reminderActive as boolean
            }
        );
    }

    readForm(): CampaignReminder {
        const model = this.form.value;
        const date = new Date(model.reminderDate);
        this.reminder.id = model.id;
        this.reminder.campaignId = model.campaignId;
        this.reminder.reminderDate = new Date(date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            model.reminderHour,
            model.reminderMinute,
            0
        );
        this.reminder.reminderActive = model.reminderActive;
        return this.reminder;
    }

    setCampaign(campaign: Campaign) {
        this.campaign = campaign;
        if (this.campaign.id > 0) {
            this.form.disable();
            this.isLoading = true;
            this.reminderService.getCampaignReminder(this.campaign.id).subscribe(
                data => {
                    this.reminder = data ? data : this.getNewReminder();
                    this.canEdit = this.currentUser === campaign.owner;
                    this.setForm(this.reminder);
                    this.isLoading = false;
                }
            );
        }
    }

    getNewReminder(): CampaignReminder {
        const reminder = new CampaignReminder();
        const date = new Date(this.campaign.startDate);
        reminder.id = 0;
        reminder.campaignId = this.campaign.id;
        reminder.reminderDate = date;
        reminder.reminderActive = true;
        return reminder;
    }

    edit(): void {
        this.submittedCount = 0;
        this.form.enable();
    }

    cancel(): void {
        this.setForm(this.reminder);
        this.form.disable();
    }

    save(): void {
        if (!this.form.valid) { return; }
        this.form.disable();
        const reminder = this.readForm();
        this.loadingStart('Saving campaign reminder...');
        if (reminder.id > 0) {
            this.editReminder(reminder);
        } else {
            this.addReminder(reminder);
        }
    }

    editReminder(reminder: CampaignReminder): void {
        this.reminderService.editCampaignReminder(reminder).subscribe(
            () => {
                this.reminder = reminder;
                this.setForm(this.reminder);
                this.alertService.success('The reminder has been saved successfully.');
                this.loadingStop();
            },
            error => {
                this.alertService.error(error);
                this.loadingStop();
            }
        );
    }

    addReminder(reminder: CampaignReminder): void {
        this.reminderService.addCampaignReminder(reminder).subscribe(
            data => {
                this.reminder = reminder;
                this.reminder.id = data;
                this.setForm(this.reminder);
                this.alertService.success('The reminder has been updated successfully.');
                this.loadingStop();
            },
            error => {
                this.alertService.error(error);
                this.loadingStop();
            }
        );
    }
}
