import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { BreadcrumbProductService } from '../../services/breadcrumb-product.service';

@Component({
    styleUrls: [ './product-option-list.component.css' ],
    templateUrl: './product-option-list.component.html',
    selector: 'product-option-list'
})
export class ProductOptionListComponent  implements OnInit {
    constructor(private readonly breadcrumbService: BreadcrumbProductService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a product option');
    }
}
