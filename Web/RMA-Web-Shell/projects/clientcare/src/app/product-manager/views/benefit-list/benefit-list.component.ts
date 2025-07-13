import { Component, OnInit } from '@angular/core';
import { BreadcrumbProductService } from '../../services/breadcrumb-product.service';
@Component({
    templateUrl: './benefit-list.component.html'
})
export class BenefitListComponent implements OnInit {
    constructor(private readonly breadcrumbService: BreadcrumbProductService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a benefit');
    }
}
