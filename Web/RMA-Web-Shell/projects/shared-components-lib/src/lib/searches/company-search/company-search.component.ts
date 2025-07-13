import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { debounceTime } from 'rxjs/operators';
import { CompanySearchDataSource } from './company-search.datasource';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MatDialog } from '@angular/material/dialog';
import { HoldingCompanyDialogComponent } from 'projects/clientcare/src/app/shared/company/holding-company-dialog/holding-company-dialog.component';
import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';

@Component({
    selector: 'company-search',
    templateUrl: './company-search.component.html',
    styleUrls: ['./company-search.component.css']
})

export class CompanySearchComponent implements OnInit, OnChanges {

    @Input() title = 'Search Companies'; // optional: allows the user to set the title else the default will be displayed
    @Input() allowAddOnNoResult = false; // optional: allows the user to add a new company if no result is found: default = false
    @Input() rolePlayerId: number; // optional: allows the serach to be filtered within the context or the given context if set else will search all
    @Input() companyLevel: CompanyLevelEnum; // optional: allows the serach to be filtered within the context or the given context if set else will search all

    @Output() companySelectedEmit = new EventEmitter<Company>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    displayedColumns: string[] = ['name', 'referenceNumber', 'compensationFundReferenceNumber', 'vatRegistrationNo', 'actions'];
    dataSource: CompanySearchDataSource;

    form: any;

    searchTerm = '';
    selectedCompany: Company;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly memberService: MemberService,
        public dialog: MatDialog
    ) {
        this.dataSource = new CompanySearchDataSource(this.memberService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.rolePlayerId && this.rolePlayerId > 0) {
            this.dataSource.rolePlayerId = this.rolePlayerId;
        }

        if (this.companyLevel && this.companyLevel > 0) {
            this.dataSource.companyLevelId = +this.companyLevel;
        }

        this.getData();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }]
        });
    }

    configureSearch() {
        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.searchTerm = searchTerm;
        if (!this.searchTerm || this.searchTerm.length > 2) {
            this.paginator.pageIndex = 0;
            this.getData();
        } else {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
            this.getData();
        }
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm?.trim());
    }

    companySelected(company: Company) {
        this.selectedCompany = company;
        this.companySelectedEmit.emit(this.selectedCompany);
    }

    reset() {
        this.searchTerm = null;
        this.selectedCompany = null;
        
        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    add() {
        const dialogRef = this.dialog.open(HoldingCompanyDialogComponent, {
            width: '70%',
            maxHeight: '750px',
            data: {
                rolePlayer: new RolePlayer(),
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.companySelected(result.company);
            }
        });
    }
}
