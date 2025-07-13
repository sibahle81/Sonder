import { Component, OnInit } from '@angular/core';
import { UserManagerBreadcrumbService } from '../../shared/services/user-manager-breadcrumb.service';

@Component({
    templateUrl: './role-list.component.html'
})
export class RoleListComponent implements OnInit {
    constructor(private readonly breadcrumbService: UserManagerBreadcrumbService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a role');
    }
}
