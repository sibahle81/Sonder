import { Component, OnInit, ViewChild } from '@angular/core';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { ProductDetailsComponent } from 'projects/clientcare/src/app/product-manager/views/product-details/product-details.component';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ItemType } from 'projects/clientcare/src/app/product-manager/models/item-type.enum';
import { ProductNotesComponent } from 'projects/clientcare/src/app/product-manager/views/product-notes/product-notes.component';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { ProductRulesComponent } from 'projects/clientcare/src/app/product-manager/views/product-rules/product-rules.component';
import { BreadcrumbProductService } from 'projects/clientcare/src/app/product-manager/services/breadcrumb-product.service';
import { ProductDocumentsComponent } from 'projects/clientcare/src/app/product-manager/views/product-documents/product-documents.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './product-view.component.html'
})
export class ProductViewComponent implements OnInit {
    @ViewChild(ProductDetailsComponent, { static: true }) detailsComponent: ProductDetailsComponent;
    @ViewChild(ProductRulesComponent, { static: true }) rulesComponent: ProductRulesComponent;
    @ViewChild(AuditLogComponent, { static: true }) auditLogComponent: AuditLogComponent;
    @ViewChild(ProductNotesComponent, { static: true }) notesComponent: ProductNotesComponent;
    @ViewChild(ProductDocumentsComponent, { static: true }) documentsComponent: ProductDocumentsComponent;
    canEdit: boolean;
    currentId: number;
    isLoading: boolean;

    constructor(private readonly activatedRoute: ActivatedRoute,
        private router: Router,
        private readonly productsService: ProductService,
        private readonly breadCrumbService: BreadcrumbProductService) {
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.checkUserAddPermission();
        this.breadCrumbService.setBreadcrumb('View Product');

        this.activatedRoute.params.subscribe((params: any) => {
            if (params.id) {
                this.currentId = params.id;
                this.productsService.getProduct(params.id)
                    .subscribe(product => {
                        this.detailsComponent.setViewData(product);
                        this.rulesComponent.setViewData(product);
                        this.documentsComponent.setViewData(product);
                        this.getNotes(this.currentId, ServiceTypeEnum.ProductManager, 'Product');
                        this.getAuditDetails(this.currentId, ServiceTypeEnum.ProductManager, ItemType.Product);
                        this.isLoading = false;
                    });
            }
        });

    }

    private checkUserAddPermission(): void {
        this.canEdit = userUtility.hasPermission('Edit Product');
    }

    /** @description Gets the audit details for the selected details class */
    getAuditDetails(id: number, serviceType: number, itemType: number): void {
        const auditRequest = new AuditRequest(serviceType, itemType, id);
        this.auditLogComponent.getData(auditRequest);
    }

    /** @description Gets the notes for the selected details class */
    getNotes(id: number, serviceType: number, itemType: string): void {
        const noteRequest = new NotesRequest(serviceType, itemType, id);
        this.notesComponent.getData(noteRequest);
    }

    back(): void {
        this.router.navigate(['/clientcare/product-manager/product-list']);
    }

    edit(): void {
        this.router.navigate(['/clientcare/product-manager/product/product/new', this.currentId]);
    }
}
