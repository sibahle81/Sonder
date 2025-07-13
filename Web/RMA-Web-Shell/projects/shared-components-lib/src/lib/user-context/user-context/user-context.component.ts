import { Component, Output, EventEmitter, ViewChild, Input, OnChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { UserCompanyMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';
import { UserContextDataSource } from './user-context.datasource';

@Component({
    selector: 'user-context',
    templateUrl: './user-context.component.html',
    styleUrls: ['./user-context.component.css']
})

export class UserContextComponent implements OnChanges {
    @Input() userId: number;
    @Output() contextSelectedEmit = new EventEmitter<LinkedUserMember>();
    @Output() closeEmit = new EventEmitter<boolean>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    displayedColumns: string[] = ['name', 'userCompanyMapStatus', 'actions'];
    dataSource: UserContextDataSource;

    selectedLinkedUserMember: LinkedUserMember;

    constructor(
        private readonly memberService: MemberService
    ) {
        this.dataSource = new UserContextDataSource(this.memberService);
    }

    ngOnChanges() {
        this.search();
    }

    search() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
        this.getData();
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.userId.toString());
    }

    getStatus(userCompanyMapStatus: UserCompanyMapStatusEnum): string {
        return this.formatText(UserCompanyMapStatusEnum[userCompanyMapStatus]);
    }

    formatText(text: string): string {
        return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
    }

    contextSelected(linkedUserMember: LinkedUserMember) {
        this.selectedLinkedUserMember = linkedUserMember;
        this.contextSelectedEmit.emit(this.selectedLinkedUserMember);
    }

    close() { 
        this.closeEmit.emit();
    }
}
