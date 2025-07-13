import { OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { NotesRequest } from '../notes/notes-request';
import { NotesComponent } from '../notes/notes.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BaseClass } from 'src/app/core/models/base-class.model';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';

export abstract class BaseSearchComponent implements OnInit {
    form: FormGroup;
    currentQuery: string;

    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('filter') filter: ElementRef;
    @ViewChild(NotesComponent) notesComponent: NotesComponent;

    constructor(
        public readonly dataSource: Datasource,
        protected readonly formBuilder: FormBuilder,
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
        this.form = this.formBuilder.group({ query: new FormControl('', [Validators.minLength(3), Validators.required]) });
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
