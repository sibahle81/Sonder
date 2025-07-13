import { Component, OnInit } from '@angular/core';
import { BreadcrumbClientService } from '../../shared/services/breadcrumb-client.service';

@Component({
    templateUrl: './find-group.component.html'
})
export class FindGroupComponent implements OnInit {
    constructor(private readonly breadcrumbService: BreadcrumbClientService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a group');
    }
}
