import { Component, OnInit } from '@angular/core';
import { ConfigurationManagerBreadcrumbService } from '../../shared/configuration-manager-breadcrumb.service';

@Component({
    templateUrl: './configuration-manager-home.component.html'
})
export class ConfigurationManagerHomeComponent implements OnInit {
    constructor(private readonly breadcrumbService: ConfigurationManagerBreadcrumbService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Set Settings');
    }
}
