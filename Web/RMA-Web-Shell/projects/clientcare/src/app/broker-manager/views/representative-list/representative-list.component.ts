import { Component, OnInit } from '@angular/core';
import { BreadcrumbBrokerService } from '../../services/breadcrumb-broker.service';

@Component({
    selector: 'representative-list',
    templateUrl: './representative-list.component.html',
})
export class RepresentativeListComponent implements OnInit {

    constructor(private readonly breadcrumbService: BreadcrumbBrokerService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a Agent');
    }
}
