import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { RoleSearchV2DataSource } from './role-search-V2.datasource';

@Component({
    selector: 'role-search-V2',
    templateUrl: './role-search-V2.component.html',
    styleUrls: ['./role-search-V2.component.css']
})

export class RoleSearchV2Component extends UnSubscribe implements OnInit, OnChanges {
    @Input() title = 'Search Role';
    @Input() triggerReset: boolean;

    @Output() roleSelectedEmit: EventEmitter<Role> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    selectedRole: Role;
    dataSource: RoleSearchV2DataSource;
    form: any;
    searchTerm = '';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly userService: UserService
    ) {
        super();
        this.dataSource = new RoleSearchV2DataSource(this.userService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.reset();
        }
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }]
        });

        this.getData();
    }

    configureSearch() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.paginator.pageIndex = 0;
        this.searchTerm = searchTerm;
        !this.searchTerm || this.searchTerm === '' ? this.getData() : this.searchTerm?.length >= 3 ? this.getData() : null;
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    roleSelected(role: Role) {
        this.selectedRole = role;
        this.roleSelectedEmit.emit(this.selectedRole);
    }

    reset() {
        if (!this.form) { return; }

        this.searchTerm = '';

        this.form.patchValue({
            searchTerm: this.searchTerm
        });

        this.selectedRole = null;
        this.roleSelectedEmit.emit(this.selectedRole);

        if (this.dataSource.data && this.dataSource.data.data) {
            this.dataSource.data.data = null;
        }
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'name', show: true },
            { def: 'action', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
