import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { Subscription, interval } from 'rxjs';
import { ImportGroupIndividualListDatasource } from './import-group-individual-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { UploadService } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.service';
import { BreadcrumbPolicyService } from '../../shared/Services/breadcrumb-policy.service';
import { Import } from '../../shared/entities/import';
import { ImportRequest } from '../../shared/entities/import-request';
import { PolicyImportsService } from '../../shared/Services/policy-imports.service';
import { ImportLog } from '../../shared/entities/import-log';
import { ImportType } from '../../shared/enums/import-type.enum';

@Component({
    templateUrl: './import-group-individual-list.component.html',
    providers: [DatePipe]
})

export class ImportGroupIndividualsListComponent extends ListComponent implements OnInit, OnDestroy {
    currentDataContext: ImportGroupIndividualListDatasource;
    currentAlertService: AlertService;
    reloading: Subscription;
    count = 0;
    message = 'Manual Refresh';
    autoRefresh: boolean;
    constructor(
        alertService: AlertService,
        router: Router,
        dataSource: ImportGroupIndividualListDatasource,

        private readonly breadcrumbService: BreadcrumbPolicyService,
        private readonly policyImportsService: PolicyImportsService,
        private readonly uploadService: UploadService,
        private readonly policyImportService: PolicyImportsService,
        private datePipe: DatePipe) {

        super(alertService, router, dataSource, '', 'Group Individual import', 'Group Individual import', '', false, true);
        this.hideAddButton = true;
        this.hideAddButtonText = '';
        this.currentDataContext = dataSource;
        this.currentAlertService = alertService;
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.retrieveCookieSettings();
        this.breadcrumbService.setBreadcrumb('Group Individual import');
        this.refreshSubscribe();
    }

    retrieveCookieSettings() {
        this.autoRefresh = JSON.parse(sessionStorage.getItem('autoRefreshInsuredLivesList'));
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
        this.policyImportsService.cancelInsuredLifeImport(row).subscribe(() => this.reload());
    }

    onResume(row: Import): void {
        this.unsubscribeReloading();
        this.uploadService.getUploadFile(row.fileRefToken).subscribe(data => {
            if (data) {
                const importRequest = new ImportRequest();
                importRequest.importReference = row.fileRefToken;
                importRequest.importUri = data.url;
                this.policyImportsService.importFile(importRequest)
                    .subscribe(() => this.reload());
            }
        });
    }

    onDelete(row: Import): void {
        this.unsubscribeReloading();
        this.policyImportsService.deleteInsuredLifeImport(row.id).subscribe(() => {
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


    getExceptionReport(item: Import) {
        this.policyImportsService.getReport(item.id).subscribe(data => {
            const fileName = 'Exception Report.csv';
            const csvData = data.map(log => this.transform(log));
            const blob = new Blob([csvData as unknown as BlobPart], { type: 'text/csv' });
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
        });
    }

    transform(log: ImportLog): string {
        return `\r\n${log.createdBy},${log.createdDate},${log.message}`;
    }

    onApprove(item: Import) {
        const importRequest = new ImportRequest();
        importRequest.importReference = item.fileRefToken;
        importRequest.importType = ImportType.GroupIndividual;
        importRequest.isImportApproved = true;
        this.policyImportService.importFile(importRequest).subscribe(result => {
            if (result) {
                this.reload();
            }
        });
    }


    downloadTemplate() {
        const columns = new Array('Minename',
            'PassportNumber',
            'IDNumber',
            'Name',
            'Surname',
            'Country',
            'CompanyContribution',
            'EmployeeContribution',
            'IndustryNumber',
            'DateOfBirth',
            'TotalAmount',
            'date');
        const fileName = 'Group_Template.csv';
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
