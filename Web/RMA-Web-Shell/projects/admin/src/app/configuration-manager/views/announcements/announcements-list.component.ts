import { Component, OnInit, Output, ViewChild, EventEmitter, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Announcement } from 'projects/shared-models-lib/src/lib/common/announcement';
import { AnnouncementsDataSource } from './announcements.datasource';
import { AnnouncementService } from 'projects/shared-services-lib/src/lib/services/announcement/announcement.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'announcements-list',
    templateUrl: './announcements-list.component.html',
})
export class AnnouncementsListComponent implements OnInit, AfterViewInit {
    displayedColumns = ['Name', 'IsMandatory', 'IncludeAllRoles', 'StartDate', 'EndDate', 'Actions'];
    dataSource: AnnouncementsDataSource;
    announcements: Announcement[];
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @Output() announcementEmit: EventEmitter<Announcement> = new EventEmitter();

    constructor(
        public readonly alertService: AlertService,
        private readonly announcementService: AnnouncementService, 
        private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.dataSource = new AnnouncementsDataSource(this.announcementService);
        this.paginator.pageIndex = 0;
        this.loadData();
    }

    ngAfterViewInit(): void {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

        merge(this.sort.sortChange, this.paginator.page)
          .pipe(
            tap(() => this.loadData())
          )
          .subscribe();

        this.changeDetectorRef.detectChanges();
    }

    loadData(): void {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction === '' ? 'asc' : this.sort.direction);
    }

    onSelect(announcement: Announcement): void {
        this.announcementEmit.emit(announcement);
    }
}
