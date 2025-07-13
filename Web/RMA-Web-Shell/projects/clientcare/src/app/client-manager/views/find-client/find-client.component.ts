import { Component, OnInit } from '@angular/core';
import { BreadcrumbClientService } from '../../shared/services/breadcrumb-client.service';

@Component({

    templateUrl: './find-client.component.html'
})
export class FindClientComponent implements OnInit {
    constructor(private readonly breadcrumbService: BreadcrumbClientService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a client');
    }
}
