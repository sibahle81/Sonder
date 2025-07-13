import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserSearchV2DataSource } from './user-search-V2.datasource';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { UserTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-type-enum';

@Component({
    selector: 'user-search-V2',
    templateUrl: './user-search-V2.component.html',
    styleUrls: ['./user-search-V2.component.css']
})

export class UserSearchV2Component extends UnSubscribe implements OnInit, OnChanges {
    @Input() title = 'Search User';
    @Input() allowMultiple = false; // optional will default to single select

    //-------------should not be used together, if both are passed in, the permissions will be used and roleIds will be ignored----------------
    @Input() roleIds: number[]; // optional if passed in the search will be limited to users within these roles
    //OR
    @Input() permissions: string[]; // optional if passed in the search will be limited to users that have a role that includes these permissions
    //---------------------------------------------------------------------------------------------------------------------------------------

    @Input() userType: UserTypeEnum; // optional if passed in the search will be limited to Internal users only, External users only. Default behaviour will search ALL users
    @Input() triggerReset: boolean; // optional to trigger a reset of the component from external
    @Input() isReadOnly = false; // optional defaults to false, if set to true the component will be readonly

    @Output() usersSelectedEmit: EventEmitter<User[]> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    selectedUsers: User[];
    dataSource: UserSearchV2DataSource;
    form: any;
    searchTerm = '';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly userService: UserService
    ) {
        super();
        this.dataSource = new UserSearchV2DataSource(this.userService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.reset();
        }

        this.getData();
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
        if (this.permissions?.length > 0) {
            this.dataSource.permissions = this.permissions?.length > 0 ? this.permissions : null;
            this.dataSource.roleIds = null;
        } else if (this.roleIds?.length > 0) {
            this.dataSource.permissions = null;
            this.dataSource.roleIds = this.roleIds?.length ? this.roleIds : null;
        } else {
            this.dataSource.permissions = null;
            this.dataSource.roleIds = null;
        }

        this.dataSource.userType = this.userType;

        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    userSelected(user: User) {
        if (!this.selectedUsers) { this.selectedUsers = []; }

        if (this.allowMultiple) {
            let index = this.selectedUsers.findIndex(a => a.id === user.id);
            if (index > -1) {
                this.selectedUsers.splice(index, 1);
            } else {
                this.selectedUsers.push(user);
            }
        } else {
            if (this.selectedUsers.length > 0) {
                this.selectedUsers[0] = user;
            } else {
                this.selectedUsers.push(user);
            }
        }

        this.usersSelectedEmit.emit(this.selectedUsers);
    }

    isSelected($event: User): boolean {
        return !this.selectedUsers ? false : this.selectedUsers.some(s => s.id == $event.id)
    }

    reset() {
        if (!this.form) { return; }

        this.searchTerm = '';

        this.form.patchValue({
            searchTerm: this.searchTerm
        });

        this.selectedUsers = [];
        this.usersSelectedEmit.emit(this.selectedUsers);

        if (this.dataSource.data && this.dataSource.data.data) {
            this.dataSource.data.data = null;
        }

        this.getData();
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'displayName', show: true },
            { def: 'email', show: true },
            { def: 'name', show: true },
            { def: 'selectSingle', show: !this.allowMultiple && !this.isReadOnly },
            { def: 'selectMultiple', show: this.allowMultiple && !this.isReadOnly }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
