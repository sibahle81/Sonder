import { Component, OnInit } from '@angular/core';
import { UserManagerBreadcrumbService } from '../../shared/services/user-manager-breadcrumb.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Router } from '@angular/router';

@Component({
    templateUrl: './user-home.component.html'
})
export class UserHomeComponent implements OnInit {
    constructor(
        private readonly breadcrumbService: UserManagerBreadcrumbService,
        private readonly router: Router,
    ) { }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a user');
    }

    userSelected(users: User[]): void {
        if (users && users.length > 0) {
            this.router.navigate(['user-manager/user-details', users[0].id]);
        }
    }
}
