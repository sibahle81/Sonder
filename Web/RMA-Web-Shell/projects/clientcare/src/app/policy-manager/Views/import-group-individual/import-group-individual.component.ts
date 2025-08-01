﻿import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { ImportType } from '../../shared/enums/import-type.enum';
import { BreadcrumbPolicyService } from '../../shared/Services/breadcrumb-policy.service';
import { ImportRequest } from '../../shared/entities/import-request';
import { PolicyImportsService } from '../../shared/Services/policy-imports.service';

@Component({

    selector: 'import-group-individual',
    templateUrl: './import-group-individual.component.html'
})
export class ImportGroupIndividualComponent implements OnInit {
    @ViewChild(UploadControlComponent) uploadControlComponent: UploadControlComponent;
    disabled = true;

    constructor(
        private readonly breadcrumbService: BreadcrumbPolicyService,
        private readonly router: Router,
        private readonly alertService: AlertService,
        private readonly policyImportService: PolicyImportsService,
        private readonly location: Location) {
    }

    ngOnInit() {
        this.subscribeUploadChanged();
        this.breadcrumbService.setBreadcrumb('Import Group Funeral lives');
    }

    subscribeUploadChanged(): void {
        this.uploadControlComponent.uploadChanged.subscribe(data => {
            if (data) {
                this.disabled = false;
            } else {
                this.disabled = true;
            }
        });
    }

    save(): void {
        const files = this.uploadControlComponent.getUploadedFiles();

        if (files.length > 1) { this.alertService.error('Please ensure one file is selected.'); return; }

        if (files || !files[0].hasError) {
            this.disabled = true;
            const importRequest = new ImportRequest();
            importRequest.importReference = files[0].token;
            importRequest.importType = ImportType.GroupIndividual;
            importRequest.importUri = files[0].url;
            importRequest.isImportApproved = false;
            this.policyImportService.importFile(importRequest).subscribe(result => {
                if (result) {
                    this.navigate();
                }
            });
        } else {
            this.disabled = true;
            this.alertService.error('File hasn\'t uploaded. Please try again.'); return;
        }
    }

    navigate(): void {
        this.router.navigate(['/clientcare/policy-manager/import-group-individual-list']);
    }

    back(): void {
        this.location.back();
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
