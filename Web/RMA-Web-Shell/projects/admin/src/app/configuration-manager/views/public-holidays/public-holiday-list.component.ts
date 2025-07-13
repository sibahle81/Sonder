import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PublicHoliday } from '../../Shared/public-holiday';
import { PublicHolidayDataSource } from './public-holidays.datasource';
import { PublicHolidayService } from '../../shared/public-holiday.service';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';





@Component({
// tslint:disable-next-line: component-selector
    selector: 'holiday-list',
    templateUrl: './public-holiday-list.component.html',
})
export class PublicHolidayListComponent implements OnInit {
    displayedColumns = ['Name', 'HolidayDate', 'Actions'];
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;
    @Output() publicHolidayEmit: EventEmitter<PublicHoliday> = new EventEmitter();
    constructor(public readonly dataSource: PublicHolidayDataSource,
                private readonly router: Router, private readonly datePipe: DatePipe,
                private readonly confirmservice: ConfirmationDialogsService, public readonly alertService: AlertService,
                private readonly publicHolidayService: PublicHolidayService, ) {

    }

    ngOnInit() {
        this.getAllHolidays();
    }

    getAllHolidays(): void {
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.getData();
        this.dataSource.isLoading = false;
    }

    onSelect(publicHoliday: PublicHoliday): void {
        this.publicHolidayEmit.emit(publicHoliday);
    }

    onDelete(publicHoliday: PublicHoliday): void {
        this.confirmservice.confirmWithoutContainer(' Delete', ' Are you sure you want to delete ' + publicHoliday.name + ' holiday?', 'Center', 'Center', 'Yes', 'No').subscribe(
            result => {
                if (result === true) {
                    this.publicHolidayService.deletePublicHoliday(publicHoliday).subscribe(res => {
                        this.done('Holiday deleted successfully');
                    });
                }
            });

    }

    done(statusMesssage: string) {
        this.alertService.success(statusMesssage, 'Success', true);
        // this.router.navigate(['fincare/billing-manager/declaration-list']);
        this.dataSource.isLoading = true;
        this.dataSource.getData();
    }

    applyFilter(filterValue: any) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
