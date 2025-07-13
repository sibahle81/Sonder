import { Component, OnInit } from '@angular/core';
import { BreadcrumbProductService } from '../../services/breadcrumb-product.service';

@Component({
    templateUrl: './product-home.component.html'
})
export class ProductHomeComponent implements  OnInit {
    constructor(private readonly breadcrumbService: BreadcrumbProductService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Product Home');
    }
}
