import { Component, OnInit } from '@angular/core';
import { BreadcrumbProductService } from '../../services/breadcrumb-product.service';

@Component({
    templateUrl: './discount-type-list.component.html'
})
export class DiscountTypeListComponent implements OnInit {
    constructor(private readonly breadcrumbService: BreadcrumbProductService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a discount type');
    }
}
