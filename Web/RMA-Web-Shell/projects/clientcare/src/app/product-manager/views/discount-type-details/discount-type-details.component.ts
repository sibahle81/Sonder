import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { RuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/rule-type-enum';
import { BreadcrumbProductService } from 'projects/clientcare/src/app/product-manager/services/breadcrumb-product.service';
import { DiscountTypeService } from 'projects/clientcare/src/app/product-manager/services/discount-type.service';
import { DiscountType } from 'projects/clientcare/src/app/product-manager/models/discount-type';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ItemType } from '../../models/item-type.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './discount-type-details.component.html',
    providers: [DatePipe]
})
export class DiscountTypeComponent extends DetailsComponent implements OnInit {
    ruleTypeEnum = RuleTypeEnum;
    currentCode = '';
    currentName = '';
    currentEffectiveDate: Date;

    constructor(
        alertService: AlertService,
        router: Router,
        appEventsManager: AppEventsManager,
        private readonly breadcrumbService: BreadcrumbProductService,
        private readonly discountTypeService: DiscountTypeService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder) {

        super(appEventsManager, alertService, router, 'Discount Type', 'clientcare/product-manager/find-discount-type', 1);
    }

    ngOnInit(): void {
        this.resetPermissions();

        this.activatedRoute.params.subscribe((params: any) => {
            if (params.id) {
                this.loadingStart('Loading discount type details...');

                this.createForm();
                this.getDiscountType(params.id);
                this.form.disable();
                this.breadcrumbService.setBreadcrumb('Edit a discount type');
            } else {
                this.createForm();
                this.checkUserAddPermission();
                this.breadcrumbService.setBreadcrumb('Add a discount type');
            }
        });
    }

    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Discount Type');
    }

    createForm(): void {
        this.clearDisplayName();
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id: 0,
            code: new UntypedFormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]),
            name: new UntypedFormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
            effectiveDate: new UntypedFormControl('', [Validators.required]),
            discountPercentage: new UntypedFormControl('', [Validators.required, Validators.max(100), Validators.min(0.01)]),
            description: new UntypedFormControl('', [Validators.required])
        });
    }

    readForm(): DiscountType {
        const formModel = this.form.value;
        const discountType = new DiscountType();
        discountType.id = formModel.id as number;
        discountType.name = formModel.name.trim();
        discountType.code = formModel.code.trim();
        discountType.description = formModel.description;
        discountType.discountPercentage = formModel.discountPercentage;
        discountType.effectiveDate = this.parseForDate(formModel.effectiveDate);
        return discountType;
    }

    setForm(discountType: DiscountType): void {
        if (!this.form) { this.createForm(); }
        this.canEdit = discountType.canEdit;
        this.form.patchValue({
            id: discountType.id,
            code: discountType.code,
            name: discountType.name,
            effectiveDate: discountType.effectiveDate,
            discountPercentage: discountType.discountPercentage,
            description: discountType.description
        });
        this.getDisplayName(discountType);
    }

    setCurrentValues(): void {
        this.currentName = this.form.value.name.toLowerCase();
        this.currentCode = this.form.value.code.toLowerCase();
    }

    getDiscountType(id: number): void {
        this.discountTypeService.getDiscountTypeById(id)
            .subscribe(discountType => {
                this.currentCode = discountType.code.toLowerCase();
                this.currentName = discountType.name.toLowerCase();
                this.currentEffectiveDate = discountType.effectiveDate;
                this.setForm(discountType);
                this.loadingStop();
                this.getNotes(id, ServiceTypeEnum.ProductManager, 'DiscountType');
                this.getAuditDetails(id, ServiceTypeEnum.ProductManager, ItemType.DiscountType);
            });
    }

    save(): void {
        if (this.form.invalid) { return; }
        this.form.disable();
        const discountType = this.readForm();
        this.loadingStart(`Saving ${discountType.name}...`);

        if (this.form.value.id > 0) {
            this.editDiscountType(discountType);
        } else {
            this.addDiscountType(discountType);
        }
    }

    editDiscountType(discountType: DiscountType): void {
        this.discountTypeService.editDiscountType(discountType)
            .subscribe(() => this.done());
    }

    addDiscountType(discountType: DiscountType): void {
        this.discountTypeService.addDiscountType(discountType)
            .subscribe(() => this.done());
    }
}
