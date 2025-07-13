import { OnInit, ViewChild, ElementRef, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Datasource } from '../../../../shared-utilities-lib/src/lib/datasource/datasource';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { NotesRequest } from '../notes/notes-request';
import { NotesComponent } from '../notes/notes.component';

@Directive()
export abstract class BaseSearchComponent implements OnInit {
    form: UntypedFormGroup;
    currentQuery: string;

    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;
    @ViewChild(NotesComponent, { static: false }) notesComponent: NotesComponent;

    constructor(
        public readonly dataSource: Datasource,
        protected readonly formBuilder: UntypedFormBuilder,
        protected readonly router: Router,
        protected readonly routerLink: string,
        public readonly displayedColumns: string[]) {
    }

    ngOnInit(): void {
        this.createForm();
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.clearData();
    }

    onSelect(item: BaseClass): void {
        this.router.navigate([this.routerLink, item.id]);
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
    }

    readForm(): string {
        const formModel = this.form.value;
        return formModel.query as string;
    }

    search(): void {
        if (this.form.valid) {
            this.currentQuery = this.readForm();
            this.dataSource.getData(this.currentQuery);
        }
    }

    clearFilter(): void {
        this.form.patchValue({ query: '' });
    }

  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.notesComponent.getData(noteRequest);
  }
}
