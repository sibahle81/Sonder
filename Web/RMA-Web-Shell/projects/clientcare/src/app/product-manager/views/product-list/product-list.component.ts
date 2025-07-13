import { Component, OnInit } from '@angular/core';
import { BreadcrumbProductService } from '../../services/breadcrumb-product.service';

@Component({
    templateUrl: './product-list.component.html'
})
export class ProductListComponent implements  OnInit {
    constructor(private readonly breadcrumbService: BreadcrumbProductService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a product');
    }
}
