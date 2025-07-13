import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RequiredDocument } from '../../../Shared/required-document';
import { DocumentCategory } from '../../../Shared/document-category';
import { DocumentCategoryType } from '../../../Shared/document-category-type';
import { RequiredDocumentService } from '../../../shared/required-document.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { RequiredDocumentDataSource } from '../required-documents-list/required-documents.datasource';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';

@Component({
    templateUrl: './required-documents-details.component.html'
})
export class RequiredDocumentDetailsComponent extends DetailsComponent implements OnInit {
    requiredDocuments: RequiredDocument[];
    requiredDocument: RequiredDocument;
    documentCategories: DocumentCategory[];
    documentCategory: DocumentCategory;
    documentCategoryTypes: DocumentCategoryType[];
    documentCategoryType: DocumentCategoryType;
    showHideDetails: number;
    mode: string;
    showEditBtn: number;
    selectedDocumentCategory: any;
    documentCategoryId: number;
    documentCategoryName: string;
    selectedDocumentCategoryType: any;
    documentCategoryTypeId: number;
    constructor(
        private readonly formBuilder: UntypedFormBuilder,
        private readonly requiredDocumentService: RequiredDocumentService,
        private readonly router: Router,
        public readonly dataSource: RequiredDocumentDataSource,
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService) {
        super(appEventsManager, alertService, router, 'Required Documents', 'configuration-manager/', 0);

    }

    ngOnInit() {
        this.showHideDetails = 1;
        this.showEditBtn = 0;
        this.documentCategoryId = 0;
        this.documentCategoryTypeId = 0;
        this.createForm(0);

        this.requiredDocumentService.getDocumentCategories().subscribe(categories => {
            this.documentCategories = categories;
        });
        this.requiredDocumentService.getDocumentCategoryTypes().subscribe(categoryTypes => {
            this.documentCategoryTypes = categoryTypes;
        });
    }

    createForm(id: any): void {
        // if (this.form) { return; }
        this.form = this.formBuilder.group({
            id,
            documentCategoryType: new UntypedFormControl('', Validators.required),
            documentCategory: new UntypedFormControl('', Validators.required),
            documentName: new UntypedFormControl('', Validators.required)
        });
    }

    readForm(): RequiredDocument {
        const requiredDocument = new RequiredDocument();

        return requiredDocument;
    }

    setForm(requiredDocument: RequiredDocument): void {
        if (!this.form) { this.createForm(requiredDocument.id); }
        this.documentCategoryId = requiredDocument.documentCategoryId;
        this.selectedDocumentCategory = this.documentCategories.filter(x => x.id === requiredDocument.moduleId);
        this.selectedDocumentCategoryType = this.documentCategoryTypes.filter(x => x.id === requiredDocument.documentCategoryId);
        this.form.controls.documentName.setValue(requiredDocument.name);
        this.mode = 'Edit';
        this.requiredDocument = requiredDocument;
        this.showHideDetails = 2;
    }

    onSelectDocumentCategory(value: DocumentCategory) {
        if (value !== undefined) {
            this.documentCategory = value;
            this.documentCategoryId = value.id;
            this.documentCategoryName = value.name;
        } else {
            value = this.selectedDocumentCategory;
        }
    }

    onSelectDocumentCategoryType(value: DocumentCategoryType) {
        if (value !== undefined) {
            this.documentCategoryType = value;
            this.documentCategoryTypeId = value.id;
        } else {
            value = this.selectedDocumentCategoryType;
        }
    }

    save() {
        const name = this.form.controls.documentName.value;
        if (this.mode === 'Add') {
            this.requiredDocument = new RequiredDocument();
            this.requiredDocument.name = name;
            this.requiredDocument.moduleId = this.documentCategory.id;
            this.requiredDocument.module = this.documentCategory.name;
            this.requiredDocument.documentCategoryId = this.documentCategoryType.id;
            this.requiredDocumentService.addRequiredDocument(this.requiredDocument).subscribe(() => {
                this.form.disable();
                this.done('Required document successfully saved.');
            });
        }
        if (this.mode === 'Edit') {
            this.requiredDocument.name = name;
            if (this.documentCategoryTypeId > 0) {
                this.requiredDocument.documentCategoryId = this.documentCategoryTypeId;
            } else {
                this.requiredDocument.documentCategoryId = this.selectedDocumentCategoryType[0].id;
            }
            if (this.documentCategoryId > 0) {
                this.requiredDocument.moduleId = this.documentCategoryId;
                this.requiredDocument.module = this.documentCategoryName;
            } else {
                this.requiredDocument.moduleId = this.selectedDocumentCategory[0].id;
                this.requiredDocument.module = this.documentCategoryName;
            }
            this.requiredDocumentService.editRequiredDocument(this.requiredDocument).subscribe(() => {
                this.form.disable();
                this.done('Required document successfully saved.');
            });
        }
        this.showHideDetails = 1;
    }

    edit(): void {
        this.form.enable();
        this.showEditBtn = 0;
    }

    done(statusMesssage: string) {
        this.alertService.success(statusMesssage, 'Success', true);
        this.dataSource.isLoading = true;
        this.dataSource.getData();
    }

    clear() {
        this.showHideDetails = 1;
    }

    addNew() {
        this.selectedDocumentCategory = new DocumentCategory();
        this.selectedDocumentCategoryType = new DocumentCategoryType();
        this.createForm(0);
        this.requiredDocument = new RequiredDocument();
        this.showHideDetails = 2;
        this.mode = 'Add';
    }

    backToSearch() {
        this.router.navigate(['config-manager/']);
    }

    requiredDocumentChangeHandler(requiredDocument: RequiredDocument): void {
        this.showHideDetails = 2;
        this.requiredDocument = requiredDocument;
        this.mode = 'Edit';
        this.showEditBtn = 1;
        this.setForm(requiredDocument);
        this.form.disable();
    }
}
