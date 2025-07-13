import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators} from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PublicHoliday } from '../../Shared/public-holiday';
import { PublicHolidayDataSource } from './public-holidays.datasource';
import { PublicHolidayService } from '../../shared/public-holiday.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';

@Component({
    templateUrl: './public-holiday-details.component.html'
})
export class PublicHolidayDetailsComponent extends DetailsComponent implements OnInit {
    publicHolidays: PublicHoliday[];
    publicHoliday: PublicHoliday;
    showHideDetails: number;
    minDate: Date;
    holidayDate: Date;
    mode: string;
    showEditBtn: number;
    constructor(
        private readonly formBuilder: UntypedFormBuilder,
        private readonly publicHolidayService: PublicHolidayService,
        private readonly router: Router,
        public readonly dataSource: PublicHolidayDataSource,
        appEventsManager: AppEventsManager,
        public readonly alertService: AlertService) {
        super(appEventsManager, alertService, router, 'Public Holidays', 'configuration-manager/', 0);

    }

    ngOnInit() {
        this.showHideDetails = 1;
        this.showEditBtn = 0;
        this.createForm(0);
    }

    // tslint:disable-next-line: use-life-cycle-interface
    ngOnDestroy() {
    }

    createForm(id: any): void {
        // default date on create.
        const date =  new Date();
        this.form = this.formBuilder.group({
            id,
            holidayName: new UntypedFormControl('', [Validators.required, Validators.minLength(3)]),
            holidayDate: new UntypedFormControl(date, Validators.required)
        });
    }

    readForm(): PublicHoliday {
        const publicHoliday = new PublicHoliday();

        return publicHoliday;
    }

    setForm(publicHoliday: PublicHoliday): void {
        if (!this.form) { this.createForm(publicHoliday.id); }
        this.form.controls.holidayName.setValue(publicHoliday.name);
        this.form.controls.holidayDate.setValue(publicHoliday.holidayDate);
        this.mode = 'Edit';
        this.publicHoliday = publicHoliday;
        this.showHideDetails = 2;
    }

    save() {
        const name = this.form.controls.holidayName.value;
        let modifiedDate = this.form.controls.holidayDate.value;
        let resDate = null;
        if (this.holidayDate !== undefined) {
            modifiedDate = this.holidayDate;
            resDate = new Date(modifiedDate.setDate(modifiedDate.getDate() + 1));
        } else {
            modifiedDate = this.publicHoliday.holidayDate;
            resDate = modifiedDate;
        }
        if (this.mode === 'Add') {
            this.publicHoliday = new PublicHoliday();
            this.publicHoliday.name = name;
            this.publicHoliday.holidayDate = resDate;
            this.publicHolidayService.addPublicHoliday(this.publicHoliday).subscribe(() => {
                this.form.disable();
                this.done('Holiday successfully saved.');
            });
        }
        if (this.mode === 'Edit') {
            this.publicHoliday.name = name;
            this.publicHoliday.holidayDate = resDate;
            this.publicHolidayService.editPublicHoliday(this.publicHoliday).subscribe(() => {
                this.form.disable();
                this.done('Holiday successfully saved.');
            });
        }
        this.showHideDetails = 1;
    }

    edit(): void {
        this.form.enable();
        this.showEditBtn = 0;
        this.form.get('holidayName').disable();
    }

    done(statusMesssage: string) {
        this.dataSource.isLoading = true;
        this.dataSource.getData();
        this.alertService.success(statusMesssage);
    }

    clear() {
        this.showHideDetails = 1;
    }

    addNew() {
        this.createForm(0);
        this.publicHoliday = new PublicHoliday();
        this.showHideDetails = 2;
        this.mode = 'Add';
    }

    backToSearch() {
        this.router.navigate(['config-manager/']);
    }

    holidayDateChange(value: Date) {
        this.holidayDate = value;
    }

    holidayChangeHandler(publicHoliday: PublicHoliday): void {
        this.showHideDetails = 2;
        this.mode = 'Edit';
        this.showEditBtn = 1;
        this.setForm(publicHoliday);
        this.form.disable();
    }
}
