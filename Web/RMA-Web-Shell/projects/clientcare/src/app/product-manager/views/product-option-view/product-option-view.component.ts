import { Component, OnInit, ViewChild } from '@angular/core';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ItemType } from 'projects/clientcare/src/app/product-manager/models/item-type.enum';
import { ProductOptionDetailComponent } from 'projects/clientcare/src/app/product-manager/views/product-option-details/product-option-detail.component';
import { ProductOptionNotesComponent } from 'projects/clientcare/src/app/product-manager/views/product-option-notes/product-option-notes.component';
import { ProductOptionBenefitsComponent } from 'projects/clientcare/src/app/product-manager/views/product-option-benefits/product-option-benefits.component';
import { ProductOptionRulesComponent } from 'projects/clientcare/src/app/product-manager/views/product-option-rules/product-option-rules.component';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { BreadcrumbProductService } from 'projects/clientcare/src/app/product-manager/services/breadcrumb-product.service';
import { ProductOptionDocumentsComponent } from 'projects/clientcare/src/app/product-manager/views/product-option-documents/product-option-documents.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { ProductOption } from '../../models/product-option';

@Component({
    templateUrl: './product-option-view.component.html'
})
export class ProductOptionViewComponent implements OnInit {
    @ViewChild(ProductOptionDetailComponent, { static: true }) detailsComponent: ProductOptionDetailComponent;
    @ViewChild(AuditLogComponent, { static: true }) auditLogComponent: AuditLogComponent;
    @ViewChild(ProductOptionNotesComponent, { static: true }) notesComponent: ProductOptionNotesComponent;
    @ViewChild(ProductOptionBenefitsComponent, { static: true }) benefitsComponent: ProductOptionBenefitsComponent;
    @ViewChild(ProductOptionRulesComponent, { static: true }) rulesComponent: ProductOptionRulesComponent;
    @ViewChild(ProductOptionDocumentsComponent, { static: true }) documentsComponent: ProductOptionDocumentsComponent;

    productOption: ProductOption;

    canEdit: boolean;
    currentId: number;
    isLoading: boolean;

    constructor(private readonly activatedRoute: ActivatedRoute,
                private router: Router,
                private readonly optionService: ProductOptionService,
                private readonly breadCrumbService: BreadcrumbProductService) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.checkUserAddPermission();
        this.breadCrumbService.setBreadcrumb('View Product Option');

        this.activatedRoute.params.subscribe((params: any) => {
            if (params.id) {
                this.currentId = params.id;
                this.optionService.getProductOption(params.id).subscribe(
                    data => {
                        this.productOption = data;
                        this.detailsComponent.setViewData(data);
                        this.rulesComponent.setViewData(data);
                        this.documentsComponent.setViewData(data);

                        this.benefitsComponent.getData(params.id);
                        this.getNotes(params.id, ServiceTypeEnum.ProductOptionManager, 'productOption');
                        this.getAuditDetails(params.id, ServiceTypeEnum.ProductManager, ItemType.ProductOption);

                        this.isLoading = false;
                    }
                );
            }
        });
    }

    private checkUserAddPermission(): void {
        this.canEdit = userUtility.hasPermission('Edit Product Option');
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
        this.router.navigate(['/clientcare/product-manager/product-option-list']);
    }

    edit(): void {
        this.router.navigate(['/clientcare/product-manager/product-option/product-option/new', this.currentId]);
    }
}
