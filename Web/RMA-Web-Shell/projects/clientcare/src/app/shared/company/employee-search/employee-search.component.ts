import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { EmployeeSearchDataSource } from './employee-search.datasource';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { CaptureEmployeeDialogComponent } from './capture-employee-dialog/capture-employee-dialog.component';

@Component({
    selector: 'employee-search',
    templateUrl: './employee-search.component.html',
    styleUrls: ['./employee-search.component.css']
})
export class EmployeeSearchComponent extends PermissionHelper implements OnInit, OnChanges {

    @Input() employerRolePlayerId: number; // optional: use only if you want to filter results on a specific roleplayerId
    @Output() personEmploymentSelectedEmit: EventEmitter<PersonEmployment> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: EmployeeSearchDataSource;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('searching...please wait');

    form: any;

    searchTerm = '';
    selectedPersonEmployment: PersonEmployment;

    employerRolePlayer: RolePlayer;
    employeeRolePlayer: RolePlayer;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly memberService: MemberService,
        public readonly dialog: MatDialog
    ) {
        super();
        this.dataSource = new EmployeeSearchDataSource(this.memberService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.employerRolePlayerId) {
            this.getEmployerRolePlayer(this.employerRolePlayerId);
            this.dataSource.employerRolePlayerId = this.employerRolePlayerId;
        }

        this.getData();
    }

    createForm(): void {
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
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    personEmploymentSelected(personEmployment: PersonEmployment) {
        this.selectedPersonEmployment = personEmployment;
        this.personEmploymentSelectedEmit.emit(this.selectedPersonEmployment);
    }

    reset() {
        this.searchTerm = null;
        this.selectedPersonEmployment = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        if (!lookup) { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'employerRolePlayerId', show: !this.employerRolePlayerId },
            { def: 'employeeRolePlayerId', show: true },
            { def: 'employeeNumber', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    setEmployer($event: RolePlayer) {
        this.employerRolePlayer = $event;
    }

    addEmployee() {
        this.employeeRolePlayer = new RolePlayer();
        this.openEmployeeDialog();
    }

    viewEmployee($event: PersonEmployment) {
        this.getEmployeeRolePlayer($event.employeeRolePlayerId);
    }

    getEmployerRolePlayer(rolePlayerId: number) {
        this.memberService.getMember(rolePlayerId).subscribe(result => {
            if (result) {
                this.employerRolePlayer = result;
            }
        });
    }

    getEmployeeRolePlayer(rolePlayerId: number) {
        this.isLoading$.next(true);
        this.loadingMessage$.next('loading employee...please wait');
        this.memberService.getMember(rolePlayerId).subscribe(result => {
            if (result) {
                this.employeeRolePlayer = result;
                this.openEmployeeDialog();
                this.isLoading$.next(false);
            }
        });
    }

    openEmployeeDialog() {
        const dialogRef = this.dialog.open(CaptureEmployeeDialogComponent, {
            width: '80%',
            maxHeight: '750px',
            disableClose: true,
            data: {
                employerRolePlayer: this.employerRolePlayer,
                employeeRolePlayer: this.employeeRolePlayer,
                title: this.employeeRolePlayer?.rolePlayerId > 0 ? 'View Employee' : 'Capture New Employee'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.reset();
        });
    }
}
