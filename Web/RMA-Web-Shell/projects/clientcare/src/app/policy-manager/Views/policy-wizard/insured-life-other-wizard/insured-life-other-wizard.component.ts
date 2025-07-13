import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { InsuredLifeWizardBase } from '../insured-life-base';
import { MatTabGroup } from '@angular/material/tabs';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UntypedFormBuilder, UntypedFormArray, UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Beneficiary } from '../../../shared/entities/beneficiary';
import { ValidateIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number.validator';
import { Location } from '@angular/common';
import { ProductOptionCover } from 'projects/clientcare/src/app/product-manager/obsolete/product-option-cover';

@Component({
    templateUrl: './insured-life-other-wizard.component.html',
    selector: 'insured-life-other'
})
export class InsuredLivesOtherWizardComponent extends InsuredLifeWizardBase implements OnInit {
    @ViewChild(MatTabGroup)
    matTabGroup: MatTabGroup;
    beneficiaryTypes: Lookup[];
    @Input()
    maximumLives: number;
    productOptionCovers: ProductOptionCover[];
    constructor(
        alertService: AlertService,
        location: Location,
        router: Router,
        appEventsManager: AppEventsManager,
        formBuilder: UntypedFormBuilder,
        private readonly lookupService: LookupService) {
        super(appEventsManager, alertService, router, formBuilder, location, 'Insured Lives');
    }

    ngOnInit(): void {
        this.isWizard = true;
        this.createForm();
        this.getBeneficiaryTypes();
    }

    onSelectionChange($event: any): void {
        const index = $event as number;
        if (this.beneficiaries) {
            if (index === (this.beneficiaries.length)) {
                this.addBeneficiary(index + 1);
            }
        }
    }

    validate(context: WizardContext, displayName: string): ValidationResult {
        const validationResult = new ValidationResult(displayName);
        this.setForm(context);

        if (this.form.status === 'PENDING') {
            validationResult.isPending = true;
            validationResult.statusChange = this.form.statusChanges;
        }

        Object.keys(this.form.controls).forEach(key => {
            if (!this.form.valid && this.form.controls[key].enabled && !this.form.controls[key].valid) {
                validationResult.errors++;
                validationResult.errorMessages.push('Field "' + key + '" is invalid');
            }
        });

        return validationResult;
    }

    disable(): void {
        this.form.disable();
    }

    enable(): void {
        this.form.enable();
    }

    createForm(): void {
        this.processContext();
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            beneficiaries: this.formBuilder.array([]),
        });
    }

    readForm(): Beneficiary[] {
        const beneficiaryList = new Array();
        for (let i = 0; i < this.form.value.beneficiaries.length; i++) {
            const formModel = this.form.value.beneficiaries[i];
            const beneficiary = new Beneficiary();
            beneficiary.id = formModel.id as number;
            beneficiary.name = formModel.name;
            beneficiary.surname = formModel.surname;
            beneficiary.idNumber = formModel.idNumber;
            beneficiary.dateOfBirth = formModel.dateOfBirth;
            beneficiary.email = formModel.email;
            beneficiary.telephoneNumber = formModel.telephoneNumber;
            beneficiary.mobileNumber = formModel.mobileNumber;
            beneficiary.hasDisability = formModel.isChildDisabled;
            beneficiary.isInsuredLife = formModel.isInsuredLife;
            beneficiary.isBeneficiary = formModel.isBeneficiary;
            beneficiary.beneficiaryTypeId = formModel.beneficiaryType;
            beneficiary.hasDisability = formModel.hasDisability;
            beneficiary.isStudying = formModel.isStudying;
            beneficiary.insuredLifeProductOptionCover = formModel.insuredLifeProductOptionCover;
            beneficiaryList.push(beneficiary);
        }
        return beneficiaryList;
    }

    setForm(item: any): void {
        const beneficiaryList = item as Beneficiary[];
        this.form.setControl('beneficiaries', new UntypedFormArray([]));

        for (let i = 0; i < beneficiaryList.length; i++) {
            const beneficiary = beneficiaryList[i];
            const beneficiaryDetail = this.createBeneficiaryDetails(i);
            beneficiaryDetail.patchValue({
                id: beneficiary.id,
                fullName: beneficiary.name + ' ' + beneficiary.surname,
                name: beneficiary.name,
                surname: beneficiary.surname,
                idNumber: beneficiary.idNumber,
                dateOfBirth: beneficiary.dateOfBirth,
                email: beneficiary.email,
                telephoneNumber: beneficiary.telephoneNumber,
                mobileNumber: beneficiary.mobileNumber,
                isInsuredLife: beneficiary.isInsuredLife,
                hasDisability: beneficiary.hasDisability,
                beneficiaryType: beneficiary.beneficiaryTypeId,
                isBeneficiary: beneficiary.isBeneficiary,
                isStudying: beneficiary.isStudying,
                insuredLifeProductOptionCover: beneficiary.insuredLifeProductOptionCover
            });
            this.beneficiaries.push(beneficiaryDetail);
        }
    }

    save(): void {
        throw new Error('Method not implemented.');
    }

    createBeneficiaryDetails(index: number): UntypedFormGroup {
        return this.formBuilder.group({
            id: 0,
            fullName: [`New Insured Life ${index}`],
            name: new UntypedFormControl('', Validators.required),
            surname: new UntypedFormControl('', Validators.required),
            idNumber: new UntypedFormControl('', [Validators.maxLength(13), ValidateIdNumber]),
            age: 0,
            dateOfBirth: new UntypedFormControl('', [Validators.required]),
            email: new UntypedFormControl(''),
            telephoneNumber: new UntypedFormControl('', [Validators.minLength(10)]),
            mobileNumber: new UntypedFormControl('', [Validators.minLength(10)]),
            isInsuredLife: new UntypedFormControl(''),
            isBeneficiary: new UntypedFormControl(''),
            hasDisability: new UntypedFormControl(''),
            isStudying: new UntypedFormControl(''),
            beneficiaryType: new UntypedFormControl(''),
            insuredLifeProductOptionCover: new UntypedFormControl('')
        });
    }

    addBeneficiary(index: number) {
        this.beneficiaries.push(this.createBeneficiaryDetails(index));
    }

    get beneficiaries(): UntypedFormArray {
        return this.form.get('beneficiaries') as UntypedFormArray;
    }

    getBeneficiaryTypes(): any {
        this.lookupService.getBeneficiaryTypes().subscribe(data => {
            this.beneficiaryTypes = data;
        });
    }

    getControl(index: number, lookupName: string) {
        if (!this.multiSelectComponentChildren) { return null; }
        const component = this.multiSelectComponentChildren.filter((child) => child.lookupName === lookupName);
        return component[index];
    }

    onIdCheck(control: AbstractControl, index: number): void {
        const value = control.value;
        const beneficiaries = this.readForm();
        const found = beneficiaries.filter(beneficiary => beneficiary.idNumber === value);
        if (found.length > 1) {
            control.setErrors({ isTaken: true });
        }

        const date = this.calculateDate(value);
        if (date) { this.beneficiaries.controls[index].get('dateOfBirth').setValue(date); }
    }

    calculateDate(value: string): Date {
        try {
            let year = Number(value.substring(0, 2));
            if (year < 20) { year += 2000; } else { year += 1900; }

            const month = Number(value.substring(2, 4));
            const day = Number(value.substring(4, 6));

            const date = new Date(`${month}/${day}/${year}`);

            return date;

        } catch (error) {
            return null;
        }
    }

    removeBeneficiary(index: number): void {
        this.beneficiaries.removeAt(index);
    }

    onIsInsuredLifeChange(control: AbstractControl, index: number) {
        if (control.value === '1') {
            this.beneficiaries.at(index).get('allocationPercentage').clearValidators();
            this.beneficiaries.at(index).get('allocationPercentage').setValue(null);
            this.beneficiaries.at(index).get('allocationPercentage').disable();

            this.beneficiaries.at(index).get('beneficiaryType').clearValidators();
            this.beneficiaries.at(index).get('beneficiaryType').setValue(null);
            this.beneficiaries.at(index).get('beneficiaryType').disable();
        } else {
            this.beneficiaries.at(index).get('beneficiaryType').setValidators([Validators.required]);
            this.beneficiaries.at(index).get('beneficiaryType').setValue(null);
            this.beneficiaries.at(index).get('beneficiaryType').enable();
        }
    }

    setCurrentValues(): void {
        throw new Error('Method not implemented.');
    }

    processContext(): any {
        if (this.context) {
            this.productOptionCovers = this.context.data[7] as ProductOptionCover[];
        }
    }
}
