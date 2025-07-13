import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RequiredDocument } from '../../../Shared/required-document';
import { RequiredDocumentDataSource } from './required-documents.datasource';
import { RequiredDocumentService } from '../../../shared/required-document.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';

@Component({
// tslint:disable-next-line: component-selector
    selector: 'required-documents-list',
    templateUrl: './required-documents-list.component.html',
})
export class RequiredDocumentListComponent implements OnInit {
    displayedColumns = ['DocumentCategoryName', 'subModule', 'Name', 'Actions'];

    get isLoading(): boolean { return this.dataSource.isLoading; }

    get isError(): boolean { return this.dataSource.isError; }

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;
    @ViewChild(MatSort, { static: true })
    sort: MatSort;
    @ViewChild('filter', { static: false })
    filter: ElementRef;
    @Output()
    requiredDocumentEmit: EventEmitter<RequiredDocument> = new EventEmitter();

    constructor(public readonly dataSource: RequiredDocumentDataSource,
                private readonly router: Router,
                private readonly confirmservice: ConfirmationDialogsService,
                private readonly alertService: AlertService,
                private readonly requiredDocumentService: RequiredDocumentService) {

    }

    ngOnInit() {
        this.getRequiredDocuments();
    }

    getRequiredDocuments(): void {
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.getData();
        this.dataSource.isLoading = false;
    }

    onSelect(requiredDocument: RequiredDocument): void {
        this.requiredDocumentEmit.emit(requiredDocument);
    }

    onDelete(requiredDocument: RequiredDocument): void {
        this.confirmservice.confirmWithoutContainer(' Delete',
            ' Are you sure you want to delete ' + requiredDocument.name + ' document?',
            'Center',
            'Center',
            'Yes',
            'No').subscribe(
            result => {
                if (result === true) {
                    this.requiredDocumentService.deleteRequiredDocument(requiredDocument).subscribe(res => {
                        if (res === true) {
                            this.done('Required Document deleted successfully');
                        }
                    });
                }
                this.done('Required Document deleted successfully');
            });
    }

    done(statusMesssage: string) {
        this.alertService.success(statusMesssage, 'Success', true);
        this.dataSource.isLoading = true;
        this.dataSource.getData();
    }

    applyFilter(filterValue: any) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
