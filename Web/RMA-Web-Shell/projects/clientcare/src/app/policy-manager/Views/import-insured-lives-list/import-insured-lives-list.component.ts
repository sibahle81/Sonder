import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location, DatePipe } from '@angular/common';


import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ImportInsuredLivesListDatasource } from './import-insured-lives-list.datasource';

import { Subscription, interval } from 'rxjs';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { UploadService } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.service';
import { BreadcrumbPolicyService } from '../../shared/Services/breadcrumb-policy.service';
import { Import } from '../../shared/entities/import';
import { ImportRequest } from '../../shared/entities/import-request';
import { PolicyImportsService } from '../../shared/Services/policy-imports.service';

@Component({
    templateUrl: './import-insured-lives-list.component.html',
    providers: [DatePipe]
})
export class ImportInsuredLivesListComponent extends ListComponent implements OnInit, OnDestroy {
    currentDataContext: ImportInsuredLivesListDatasource;
    currentAlertService: AlertService;
    reloading: Subscription;
    count = 0;
    message = 'Manual Refresh';
    autoRefresh: boolean;
    constructor(
        alertService: AlertService,
        router: Router,
        dataSource: ImportInsuredLivesListDatasource,

        private readonly breadcrumbService: BreadcrumbPolicyService,
        private readonly policyImportService: PolicyImportsService,
        private readonly uploadService: UploadService,
        private datePipe: DatePipe) {

        super(alertService, router, dataSource, '', 'Insured Life import', 'Insured Lives Imports', '', false, true);
        this.hideAddButton = true;
        this.hideAddButtonText = '';
        this.currentDataContext = dataSource;
        this.currentAlertService = alertService;
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.retrieveCookieSettings();
        this.breadcrumbService.setBreadcrumb('Insured Lives Imports');
        this.refreshSubscribe();
    }

    retrieveCookieSettings() {
        this.autoRefresh = JSON.parse(sessionStorage.getItem('autoRefreshInsuredLivesList'))
    }

    refreshSubscribe(): void {
        this.unsubscribeReloading();
        if (this.autoRefresh) {
            this.reloading = interval(1000).subscribe((i) => {
                this.count = 30 - i;
                this.message = `Refresing in (${this.count})`;
                if (i === 30) {
                    this.unsubscribeReloading();
                    this.reload();
                }
            });
        }
    }

    ngOnDestroy(): void {
        sessionStorage.setItem('autoRefreshInsuredLivesList', JSON.stringify(this.autoRefresh));
        this.unsubscribeReloading();
    }

    onCancel(row: Import): void {
        this.unsubscribeReloading();
        this.policyImportService.cancelInsuredLifeImport(row).subscribe(() => this.reload());
    }

    onResume(row: Import): void {
        this.unsubscribeReloading();
        this.uploadService.getUploadFile(row.fileRefToken).subscribe(data => {
            if (data) {
                const importRequest = new ImportRequest();
                importRequest.importReference = row.fileRefToken;
                importRequest.importUri = data.url;
                this.policyImportService.importFile(importRequest)
                    .subscribe(() => this.reload());
            }
        });
    }

    onDelete(row: Import): void {
        this.unsubscribeReloading();
        this.policyImportService.deleteInsuredLifeImport(row.id).subscribe(() => {
                this.reload();
        }, error => { this.currentAlertService.error(error); this.reload(); });
    }

    reload(): void {
        this.currentDataContext.getData();
        this.refreshSubscribe();
    }

    toggle($event: any) {
        this.autoRefresh = $event.checked;
        if (this.autoRefresh) {
            this.reload();
        } else {
            this.unsubscribeReloading();
            this.message = 'Manual refresh';
        }
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'fileName', header: 'File Name', cell: (row: Import) => `${row.fileName}` },
            { columnDefinition: 'createdBy', header: 'Invoked By', cell: (row: Import) => `${row.createdBy}` },
            { columnDefinition: 'recordCount', header: 'Number of Records', cell: (row: Import) => `${row.recordCount}` },
            { columnDefinition: 'processedCount', header: 'Processed Records', cell: (row: Import) => `${row.processedCount}` },
            { columnDefinition: 'status', header: 'Current Status', cell: (row: Import) => `${row.status}` },
            { columnDefinition: 'modifiedDate', header: 'Last Write', cell: (row: Import) => `${this.datePipe.transform(row.modifiedDate, 'medium')}` },
            { columnDefinition: 'progress', header: 'Progress', cell: (row: Import) => `${row.recordCount ? Math.round(row.processedCount / row.recordCount * 100) : 0}%` },
            { columnDefinition: 'lastError', header: 'Message', cell: (row: Import) => `${row.lastError}` }
        ];
    }

    unsubscribeReloading(): void {
        if (this.reloading) {
            this.reloading.unsubscribe();
        }
    }


    downloadTemplate() {
        const columns = new Array('PolicyNumber',
            'DateOfBirth',
            'Designation',
            'Email',
            'FirstName',
            'IdNumber',
            'LastName',
            'MobileNumber',
            'PassportNumber',
            'Telephone');
        const fileName = 'Insured_Lives_Import_Template.csv';
        const csvData = columns.join();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
    }
}
