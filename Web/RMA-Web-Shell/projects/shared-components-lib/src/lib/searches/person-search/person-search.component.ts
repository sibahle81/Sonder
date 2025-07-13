import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { debounceTime } from 'rxjs/operators';
import { PersonSearchDataSource } from './person-search.datasource';
import { Person } from '../../models/person.model';

@Component({
    selector: 'person-search',
    templateUrl: './person-search.component.html',
    styleUrls: ['./person-search.component.css']
})

export class PersonSearchComponent implements OnInit {
    @Output() personSelectedEmit = new EventEmitter<Person>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    displayedColumns: string[] = ['firstName','surname','idNumber','deathCertificateNumber', 'actions'];
    dataSource: PersonSearchDataSource;

    form: any;

    searchTerm = '';
    selectedPerson: Person;
    placeHolder = 'Search by FirstName, Surname or Identification Number, Death CertificateNumber';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly memberService: MemberService
    ) {
        this.dataSource = new PersonSearchDataSource(this.memberService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }, [Validators.required]]
        });
    }

    configureSearch() {
        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.searchTerm = searchTerm;
        if (!this.searchTerm || this.searchTerm === '') {
            this.paginator.pageIndex = 0;
            this.reset();
        } else {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
            this.getData();
        }
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    personSelected(person: Person) {
        this.selectedPerson = person;
        this.personSelectedEmit.emit(this.selectedPerson);
    }

    reset() {
        this.searchTerm = '';
        this.selectedPerson = null;
        this.form.controls.searchTerm.reset();
    }
}
