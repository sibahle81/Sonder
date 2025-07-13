import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { BreadcrumbPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/breadcrumb-policy.service';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { InsuredLife } from 'projects/clientcare/src/app/policy-manager/shared/entities/insured-life';
import { InsuredLifeBeneficiaryListComponent } from 'projects/clientcare/src/app/policy-manager/views/insured-life-beneficiary-list/insured-life-beneficiary-list.component';
import { InsuredLifePolicyProduct } from 'projects/clientcare/src/app/policy-manager/shared/entities/insured-life-policy-product';
import { InsuredLifePolicyProductService } from 'projects/clientcare/src/app/policy-manager/shared/services/insured-life-policy-product.service';
import { InsuredLifeProduct } from 'projects/clientcare/src/app/policy-manager/shared/entities/insured-life-product';
import { InsuredLifeRulesComponent } from 'projects/clientcare/src/app/policy-manager/views/insured-life-details/insured-life-rules.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Location } from '@angular/common';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { MatTabGroup, MatTabChangeEvent } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app//product-manager/models/product-option';
import { ProductOptionCover } from 'projects/clientcare/src/app//product-manager/obsolete/product-option-cover';
import { ProductOptionCoverService } from 'projects/clientcare/src/app//product-manager/obsolete/product-option-cover.service';
import { ProductOptionService } from 'projects/clientcare/src/app//product-manager/services/product-option.service';
import { RuleRequest } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-request';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ValidateIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number.validator';
import { EnumMap } from 'projects/clientcare/src/app/policy-manager/views/insured-life-details/enum-map';
import { InsuredLifeService } from 'projects/clientcare/src/app/policy-manager/shared/Services/insured-life.service';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { BeneficiaryService } from 'projects/clientcare/src/app/policy-manager/shared/Services/beneficiary.service';
import { CancellationReasonService } from 'projects/clientcare/src/app/client-manager/shared/services/cancelationReason.Service';
import { CancellationReason } from 'projects/clientcare/src/app//client-manager/shared/Entities/cancellationReason';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './insured-life-details.component.html',
})
export class InsuredLifeDetailsComponent extends DetailsComponent implements OnInit, AfterViewInit {
    @ViewChild(InsuredLifeBeneficiaryListComponent) insuredLifeBeneficiaryListComponent: InsuredLifeBeneficiaryListComponent;
    @ViewChild('relatedItemsTooltip') matTooltip: MatTooltip;
    @ViewChild(InsuredLifeRulesComponent) rulesComponent: InsuredLifeRulesComponent;
    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;
    isValidId = true;
    isProductsSelectedValid = true;
    ruleRequest: RuleRequest;
    maxDate = new Date();
    result: boolean;
    policy: Policy;
    products: InsuredLifeProduct[];
    addedProducts: InsuredLifePolicyProduct[];
    policyProductIds: number[];
    insuredLife: InsuredLife;
    isValidating = false;
    isValid = false;
    isValidationComplete = false;
    currentIdentity = '';
    tabIndex: number;
    canAddBeneficiary: boolean;
    selectedProductsIds: number[];
    beneficiaryTypes: Lookup[];
    confirming = false;
    mapping = new Array<EnumMap>();
    defaultMapping = CoverMemberTypeEnum.ExtendedFamily;
    currentProductCoverOptions: ProductOptionCover[];
    currentProduct: Product;
    currentProductOption: ProductOption;
    reasons: CancellationReason[];
    currentBeneficiaryType: number;
    selectedBeneficiaryType: any;

    get showSave(): boolean {
        if (this.form.disabled) { return false; }
        if (this.isValidating) { return false; }
        if (this.isWizard) { return false; }
        // if (!this.products) { return false; }
        // if (this.products.length === 0) { return false; }
        return this.canEdit || this.canAdd;
    }

    get showEdit(): boolean {
        if (!this.products) { return false; }
        if (this.products.length === 0) { return false; }

        return this.canEdit &&
            this.form.disabled &&
            (this.insuredLife ? this.insuredLife.status.toLowerCase() === 'active' : false);
    }

    get showAddBeneficiary(): boolean {
        if (!this.form) { return false; }
        const insuredLifeId = this.form.controls.id.value as number;
        return this.canEdit && this.canAddBeneficiary && this.form && insuredLifeId > 0;
    }

    get insuredLifeReferenceNumber(): string {
        if (this.insuredLife) { return this.insuredLife.referenceNumber; }
        return 'N/A';
    }

    get isMainMember(): boolean {
        if (!this.insuredLife) { return false; }
        return this.insuredLife.beneficiaryTypeId === BeneficiaryTypeEnum.MainMember;
    }

    get removeTooltip(): string {
        if (this.isMainMember) { return 'Unable to remove main member'; }
        return 'Please discard changes before removing.';
    }

    constructor(
        alertService: AlertService,
        private readonly location: Location,
        appEventsManager: AppEventsManager,
        private readonly breadcrumbService: BreadcrumbPolicyService,
        private readonly router: Router,
        private readonly formBuilder: FormBuilder,
        private readonly activatedRoute: ActivatedRoute,
        private readonly insuredLifeService: InsuredLifeService,
        private readonly insuredLifePolicyProductService: InsuredLifePolicyProductService,
        private readonly policyService: PolicyService,
        private readonly productService: ProductService,
        private readonly beneficiaryService: BeneficiaryService,
        private readonly productOptionCoverService: ProductOptionCoverService,
        private readonly cancellationReasonService: CancellationReasonService,
        private readonly productOptionService: ProductOptionService) {

        super(appEventsManager, alertService, router, 'Insured Life', '/clientcare/policy-manager/insured-life-list', 2);

        this.mapping.push(new EnumMap(BeneficiaryTypeEnum.MainMember, CoverMemberTypeEnum.MainMember));
        this.mapping.push(new EnumMap(BeneficiaryTypeEnum.Spouse, CoverMemberTypeEnum.Spouse));
        this.mapping.push(new EnumMap(BeneficiaryTypeEnum.Child, CoverMemberTypeEnum.Child));
        this.mapping.push(new EnumMap(BeneficiaryTypeEnum.SpecialChild, CoverMemberTypeEnum.Child));
    }

    ngOnInit() {
       //this.disabledControlsOnEdit = ['idNumber', 'passportNumber', 'dateOfBirth', 'age'];
        this.disabledControlsOnEdit = ['dateOfBirth', 'age'];
        this.resetPermissions();
        this.getBeneficiaryTypes();
        this.getCancellationReasons();
        this.checkUserPermission();
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.tabIndex) { this.tabIndex = params.tabIndex; }

            if (params.type === 'add') {

                this.loadingStart('Loading policy details...');
                this.createForm(0);
                this.subscribeIdNumberChangedEvent();
                this.getPolicy(params.id);

            } else if (params.type === 'edit') {

                this.loadingStart('Loading insured life details...');
                this.createForm(params.id);
                this.form.disable();

                this.getInsuredLife(params.id);
            } else {
                throw new Error('Could not determine the insured life details');
            }
        });
    }

    getBeneficiaryTypes(): any {
        this.beneficiaryService.getBeneficiaryTypes().subscribe(result => {
            this.beneficiaryTypes = result;
        });
    }

    ngAfterViewInit(): void {
        if (this.tabIndex) { this.matTabGroup.selectedIndex = this.tabIndex; }

        if (this.policy) {
            this.processProducts(this.policy);
        }
    }

    resetPermissions(): void {
        this.canAddBeneficiary = true;
        super.resetPermissions();
    }

    checkUserPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Insured Life');
        this.canEdit = userUtility.hasPermission('Edit Insured Life');
        this.canAddBeneficiary = userUtility.hasPermission('Add Beneficiary');
    }

    createForm(id: any): void {
        this.clearDisplayName();
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id,
            name: new FormControl('', Validators.required),
            surname: new FormControl('', Validators.required),
            idNumber: new FormControl('', [Validators.maxLength(13), ValidateIdNumber]),
            age: new FormControl({ value: 0, disabled: true }),
            dateOfBirth: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            telephoneNumber: new FormControl('', [Validators.minLength(10)]),
            mobileNumber: new FormControl('', [Validators.minLength(10)]),
            beneficiaryType: new FormControl('', [Validators.required]),
            cancelDate: new FormControl(''),
            status: new FormControl(''),
            reason: new FormControl('')
        });
    }

    readForm(): InsuredLife {
        const insuredLife = new InsuredLife();

        insuredLife.id = this.form.controls.id.value as number;
        insuredLife.name = this.form.controls.name.value as string;
        insuredLife.surname = this.form.controls.surname.value as string;
        insuredLife.idNumber = this.form.controls.idNumber.value as string;
        insuredLife.dateOfBirth = this.form.controls.dateOfBirth.value as Date;
        insuredLife.email = this.form.controls.email.value as string;
        insuredLife.telephoneNumber = this.form.controls.telephoneNumber.value as string;
        insuredLife.mobileNumber = this.form.controls.mobileNumber.value as string;
        insuredLife.beneficiaryTypeId = this.form.controls.beneficiaryType.value as number;
        insuredLife.cancellationDate = this.form.controls.cancelDate.value as Date;
        insuredLife.status = 'Active';
        insuredLife.reason = this.form.controls.reason.value as string;
        return insuredLife;
    }

    setForm(insuredLife: InsuredLife): void {
        if (!this.form) { this.createForm(insuredLife.id); }
        this.form.setValue({
            id: insuredLife.id,
            name: insuredLife.name,
            surname: insuredLife.surname,
            idNumber: insuredLife.idNumber,
            age: this.calculateAge(insuredLife.dateOfBirth),
            dateOfBirth: insuredLife.dateOfBirth,
            email: insuredLife.email,
            telephoneNumber: insuredLife.telephoneNumber ? insuredLife.telephoneNumber : '',
            mobileNumber: insuredLife.mobileNumber ? insuredLife.mobileNumber : '',
            beneficiaryType: insuredLife.beneficiaryTypeId,
            cancelDate: insuredLife.cancellationDate,
            status: insuredLife.status ? insuredLife.status : 'Active',
            reason: insuredLife.reason ? insuredLife.reason : ''
        });

        this.subscribeIdNumberChangedEvent();
        this.setAgeFromIdNumber(insuredLife.idNumber);
        this.getDisplayName(insuredLife);
        this.currentBeneficiaryType = insuredLife.beneficiaryTypeId;
    }

    private calculateAge(date: Date): number {
        const timeDiff = Math.abs(Date.now() - +(new Date(date)));
        const age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
        return age;
    }

    save(): void {
        this.validateIdAndPassport();
        this.validateBeneficiaryType();
        if (!this.validateSelectedProducts() || this.form.invalid) { return; }

        const insuredLife = this.readForm();
        this.insuredLife = insuredLife;
        this.isValidating = true;
        this.isValidationComplete = false;
        this.isValid = false;
        // insuredLife.selectedProductsIds = this.currentProductOption.id;
        this.insuredLifeService.getCoverAmount(this.insuredLife).subscribe(total => {
            const cover = this.currentProductCoverOptions.find(i => i.id === this.getSelectedProduct().productOptionCoverId);
            insuredLife.totalCoverAmount = total + cover.coverAmount;
            this.rulesComponent.executeInsuredLifeRules(this.policy, insuredLife, this.getSelectedProduct());
        });

    }

    remove(): void {
        if (!this.confirming) {
            this.confirming = true;
            this.edit();
            this.form.controls.cancelDate.setValidators([Validators.required]);
            this.form.controls.reason.setValidators([Validators.required]);
        } else {
            if (this.validateCancel()) {
                this.isValidating = true;
                this.cancelInsuredLife();
            }
        }
    }

    validateCancel(): boolean {
        if (!this.form.get('cancelDate').value) { return false; }

        const date = new Date(this.form.get('cancelDate').value);
        const lastDate = new Date(date.setDate(date.getDate()));
        if (!this.isLastDayOfMonth(lastDate)) {
            this.form.get('cancelDate').setErrors({ min: true });
            this.form.get('cancelDate').updateValueAndValidity();
            return false;
        } else {
            this.form.get('cancelDate').setErrors(null);
            this.form.get('cancelDate').updateValueAndValidity();
            return true;
        }
    }

    cancel(): void {
        this.confirming = false;
        this.form.controls.cancelDate.clearValidators();
        this.form.controls.reason.clearValidators();
        this.back();
    }

    validateIdAndPassport(): void {
        this.form.controls.idNumber.markAsTouched();
        this.form.controls.idNumber.updateValueAndValidity();
    }

    onRulesExecuted(isValid: boolean) {
        this.isValidating = false;
        this.isValidationComplete = true;
        this.isValid = isValid;

        setTimeout(() => {
            if (isValid) {
                this.form.disable();
                this.loadingStart(`Saving ${this.insuredLife.name}...`);
                if (this.insuredLife.id > 0) {
                    this.editInsuredLife(this.insuredLife);
                } else {
                    this.addInsuredLife(this.insuredLife);
                }
            }
        },
            100);
    }

    isLastDayOfMonth = (d: Date): boolean => {
        const day = d.getDate();
        const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        // Only Allow Last day of Month
        return day === lastDayOfMonth;
    }

    getPolicy(policyId: any): void {
        this.policyService.getPolicy(policyId).subscribe(policy => {
            this.policy = policy;
            this.processProducts(policy);
            if (this.form.value.id > 0) {
                this.breadcrumbService.setInsuredLifeBreadcrumb('Edit an insured life', policy);
            } else {
                this.breadcrumbService.setInsuredLifeBreadcrumb('Add an insured life', policy);
            }
        });
    }


    onlyUnique(value: any, index: any, self: any): any {
        return self.indexOf(value) === index;
    }

    processProducts(policy: Policy): void {

        if (this.currentProductCoverOptions) {
            this.filterProducts(this.currentProduct, this.currentProductCoverOptions, this.currentProductOption);
            this.loadingStop();
        } else {

            const productOptionCoverId =
                policy.clientCover[0].clientCoverOptions
                    .map(productOptionCovers => productOptionCovers.productOptionCoverId).join(',');
            this.productService.getProduct(policy.clientCover[0].productId).subscribe(product => {
                this.currentProduct = product;
                this.productOptionService.getProductOptionByProductId(product.id).subscribe(productOptions => {
                    this.productOptionCoverService.getProductOptionCoverByIds(productOptionCoverId).subscribe(
                        productOptionCovers1 => {
                            const coverOptions = Array<ProductOptionCover>();
                            const productOptionIds = productOptionCovers1.map(item => item.productOptionId).filter(this.onlyUnique);
                            productOptionIds.forEach(optionId => {
                                const productOption = productOptions.find(item => item.id === optionId);
                                this.currentProductOption = productOption;
                                if (productOption) {
                                    // const productCoverOptions = productOption.productOptionCovers;
                                    // productCoverOptions.forEach(option => {
                                    //     coverOptions.push(option);
                                    // });
                                }
                            });
                            this.currentProductCoverOptions = coverOptions;
                            this.filterProducts(this.currentProduct,
                                this.currentProductCoverOptions,
                                this.currentProductOption);
                            this.loadingStop();
                        });
                });
            });
        }
    }


    filterProducts(product: Product, productOptionCovers: ProductOptionCover[], productOption: ProductOption): void {
        this.products = new Array();
        if (productOptionCovers) {
            productOptionCovers.forEach((productOptionCover) => {
                const name = `${product.name} - ${productOptionCover.name} - R${productOptionCover.premium}`;
                const insuredLifeProduct =
                    new InsuredLifeProduct(product.id, name, productOptionCover.id, productOption.id);
                const isEnabled = this.isValidOptionForLife(productOptionCover);
                insuredLifeProduct.enabled = isEnabled;
                insuredLifeProduct.checked = (this.addedProducts != null &&
                    this.addedProducts.find(p => p.productCoverOptionId === productOptionCover.id) != null) &&
                    isEnabled;
                this.products.push(insuredLifeProduct);
            });
        } else {
            this.products.push(new InsuredLifeProduct(product.id, product.name, null, null));
        }

        if (this.products.length === 1 && (this.addedProducts === undefined || this.addedProducts == null)) {
            this.products[0].checked = true;
        }
        this.loadingStop();
    }

    private isValidOptionForLife(cover: ProductOptionCover): boolean {
        if (!this.insuredLife) { return true; }
        const age = this.calculateAge(this.insuredLife.dateOfBirth);
        const isInAgeRange = (age <= cover.maximumAge && age >= cover.minimumAge);
        const coverMemberType = this.mapping.filter(map => this.insuredLife.beneficiaryTypeId === map.beneficiaryType);
        coverMemberType.push(new EnumMap(this.insuredLife.beneficiaryTypeId, this.defaultMapping));

        const isCorrectBeneficiaryType =
            coverMemberType.findIndex(cmt => cmt.coverMemberType === cover.coverMemberTypeId) > -1;
        return isInAgeRange && isCorrectBeneficiaryType;
    }

    getInsuredLife(id: number): void {
        this.insuredLifeService.getInsuredLife(id)
            .subscribe(insuredLife => {
                this.insuredLife = insuredLife;
                this.populateBeneficiaries(id);
                this.setForm(insuredLife);
                this.getInsuredLifePolicyProducts(insuredLife.id);
                this.getNotes(id, ServiceTypeEnum.PolicyManager, 'InsuredLife');
                this.getAuditDetails(id, ServiceTypeEnum.PolicyManager, PolicyItemTypeEnum.InsuredLife);
            });
    }

    getInsuredLifePolicyProducts(insuredLifeId: any): void {
        this.insuredLifePolicyProductService.getInsuredLifePolicyProductsByInsuredLife(insuredLifeId).subscribe(
            insuredLifePolicyProducts => {
                if (insuredLifePolicyProducts != null && insuredLifePolicyProducts.length > 0) {
                    this.addedProducts = insuredLifePolicyProducts;
                    this.getPolicy(insuredLifePolicyProducts[0].policyId);
                } else {
                    this.loadingStop();
                }
            });
    }

    prepareInsuredLifeProducts(insuredLifeId: number): InsuredLifePolicyProduct[] {
        const insuredLifePolicyProducts = new Array<InsuredLifePolicyProduct>();
        const selectedProducts = this.getSelectedProducts();

        selectedProducts.forEach(selectedProduct => {
            const insuredLifePolicyProduct = new InsuredLifePolicyProduct();
            insuredLifePolicyProduct.insuredLifeId = insuredLifeId;
            insuredLifePolicyProduct.productId = selectedProduct.productId;
            insuredLifePolicyProduct.productCoverOptionId = selectedProduct.productOptionCoverId;
            insuredLifePolicyProduct.policyId = this.policy.id;
            insuredLifePolicyProducts.push(insuredLifePolicyProduct);
        });

        return insuredLifePolicyProducts;
    }

    addInsuredLifePolicyProducts(insuredLifeId: number): void {
        const insuredLifePolicyProducts = this.prepareInsuredLifeProducts(insuredLifeId);
        this.insuredLifePolicyProductService.addInsuredLifePolicyProducts(insuredLifePolicyProducts)
            .subscribe(() => this.policyService.updatePolicyPremiums(this.policy).subscribe(() => {
                this.done(this.form.controls.name.value);
            }));
    }

    editInsuredLifePolicyProducts(insuredLifeId: number): void {
        const insuredLifePolicyProducts = this.prepareInsuredLifeProducts(insuredLifeId);
        this.insuredLifePolicyProductService.editInsuredLifePolicyProducts(insuredLifePolicyProducts)
            .subscribe(() => this.policyService.updatePolicyPremiums(this.policy).subscribe(() => {
                this.done(this.form.controls.name.value);
            }));
    }

    editInsuredLife(insuredLife: InsuredLife, forceRedirect: boolean = false): void {
        this.insuredLifeService.editInsuredLife(insuredLife)
            .subscribe(() => {
                this.editInsuredLifePolicyProducts(insuredLife.id);
                this.done(this.form.controls.name.value, forceRedirect);
            });
    }

    cancelInsuredLife(): void {
        this.insuredLife = this.readForm();
        this.insuredLife.status = 'PendingCancellation';
        this.insuredLifeService.editInsuredLife(this.insuredLife)
            .subscribe(() => {
                this.insuredLifeService.cancelInsuredLives().subscribe(() => {
                    this.done(this.form.controls.name.value, true);
                });
            });
    }

    removeInsuredLife(insuredLife: InsuredLife): void {
        this.insuredLifeService.removeInsuredLife(insuredLife.id)
            .subscribe(() => {
                this.done(this.form.controls.name.value);
                this.done(this.form.controls.name.value);
            });
    }

    addInsuredLife(insuredLife: InsuredLife): void {
        this.insuredLifeService.generateReferenceNumber(this.policy.id).subscribe(reference => {
            insuredLife.referenceNumber = reference;
            this.insuredLifeService.addInsuredLife(insuredLife)
                .subscribe(insuredLifeId => {
                    this.addInsuredLifePolicyProducts(insuredLifeId);
                    this.done(this.form.controls.name.value);
                });
        });
    }


    setCurrentValues(): void {
        this.currentIdentity = this.form.controls.idNumber.value as string;
    }

    validateSelectedProducts(): boolean {
        const selectedProducts = this.getSelectedProducts();
        this.isProductsSelectedValid = selectedProducts.length > 0;

        if (!this.isProductsSelectedValid) {
            this.matTooltip.disabled = false;
            this.matTooltip.show();
        } else {
            this.selectedProductsIds = new Array<number>();
            selectedProducts.forEach(selectedProduct => {
                this.selectedProductsIds.push(selectedProduct.productId);
            });
        }
        return this.isProductsSelectedValid;
    }

    onProductChanged($event: any): void {
        this.products.forEach(product => product.checked = false);
        this.form.markAsDirty();
        const result = this.products.find((product) => product.productOptionCoverId === $event.source.value);
        result.checked = $event.source.checked;
        this.validateSelectedProducts();
    }

    getSelectedProducts(): InsuredLifeProduct[] {
        const selectedProducts = this.products.filter((product) => product.checked);
        return selectedProducts;
    }

    getSelectedProduct(): InsuredLifeProduct {
        const selectedProduct = this.products.find((product) => product.checked);
        return selectedProduct;
    }

    subscribeIdNumberChangedEvent() {
        this.form.controls.idNumber.valueChanges
            .subscribe(idNumber => {
                if (idNumber != null && idNumber !== '') {
                    if (this.form.controls.idNumber.hasError('idNumber')) {
                        this.isValidId = false;
                        return;
                    }

                    let year = Number(idNumber.substring(0, 2));
                    if (year < 20) { year += 2000; } else { year += 1900; }

                    const month = Number(idNumber.substring(2, 4));
                    const day = Number(idNumber.substring(4, 6));

                    const date = new Date(`${month}/${day}/${year}`);
                    this.form.patchValue({ dateOfBirth: date });

                    this.setAgeFromIdNumber(idNumber);
                }
            });
    }

    setAgeFromIdNumber(idNumber: string) {
        if (idNumber == null || idNumber === '') { return; }

        let year = Number(idNumber.substring(0, 2));
        if (year < 20) { year += 2000; } else { year += 1900; }

        const month = Number(idNumber.substring(2, 4));
        const day = Number(idNumber.substring(4, 6));

        const date = new Date(`${month}/${day}/${year}`);

        const timeDiff = Math.abs(Date.now() - +(new Date(date)));
        const clientAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);

        if (clientAge) {
            this.form.patchValue({ age: clientAge });
            this.form.controls.age.updateValueAndValidity();
        }
    }

    addBeneficiary(): void {
        this.router.navigate(['clientcare/policy-manager/beneficiary-details', 'add', this.form.value.id]);
    }

    populateBeneficiaries(insuredLifeId: number): void {
        if (insuredLifeId == null || insuredLifeId === 0) { return; }
        this.insuredLifeBeneficiaryListComponent.getData(insuredLifeId);
    }

    back(): void {
        this.location.back();
    }

    onBeneficiaryTypeChange($event: any) {
        this.insuredLife = this.readForm();
        const relation = $event.value as BeneficiaryTypeEnum;
        switch (relation) {
            case BeneficiaryTypeEnum.MainMember:
                this.form.get('email').setValidators([Validators.required, Validators.email]);
                this.form.get('mobileNumber').setValidators([Validators.minLength(10)]);
                this.form.get('idNumber').setValidators([Validators.maxLength(13), ValidateIdNumber]);
                break;
            default:
                this.form.get('email').clearValidators();
                this.form.get('mobileNumber').clearValidators();
                this.form.get('idNumber').clearValidators();
        }

        this.form.get('email').updateValueAndValidity();
        this.form.get('mobileNumber').updateValueAndValidity();
        this.form.get('idNumber').clearValidators();
        this.form.get('idNumber').updateValueAndValidity();
    }


    onTabSelectionChanged($event: MatTabChangeEvent): void {
        if ($event.index === 1) {
            this.insuredLife = this.readForm();
            this.processProducts(this.policy);
            this.calculateAndSetAge();
        }
    }

    getCancellationReasons(): any {
        this.cancellationReasonService.getCancellationReasons().subscribe(results => {
            this.reasons = results;
        });

    }

    calculateAndSetAge(): any {
        const age = this.calculateAge(this.insuredLife.dateOfBirth);
        this.form.patchValue({ age });
    }

    validateBeneficiaryType(): any {
        if (this.currentBeneficiaryType !== 1 && this.form.controls.beneficiaryType.value === 1) {
            this.form.get('beneficiaryType').setErrors({ 'main-member': true });
        } else {
            this.form.get('beneficiaryType').clearValidators();
        }

    }
}
