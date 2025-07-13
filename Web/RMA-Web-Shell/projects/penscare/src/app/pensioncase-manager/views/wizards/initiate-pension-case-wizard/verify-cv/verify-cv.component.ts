import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { PensCareCvCalculationService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare-cvcalculation.service';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { BeneficiaryFromRecipient } from 'projects/shared-components-lib/src/lib/models/beneficiary.model';
import { Benefit, PensionProduct, VerifyCVCalculationResponse } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { PensionProductOptionsEnum } from 'projects/shared-models-lib/src/lib/enums/pension-product-options-enum';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { FormUtil } from 'projects/shared-utilities-lib/src/lib/form-utility/form-utility';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LanguageEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/language-enum';

export class ComponentInputData {
  model: InitiatePensionCaseData
}

@Component({
  selector: 'app-verify-cv',
  templateUrl: './verify-cv.component.html',
  styleUrls: ['./verify-cv.component.css']
})
export class VerifyCvComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit  {

  form: UntypedFormGroup;
  pensionProductEnum = PensionProductOptionsEnum;
  compensationDataSource: Benefit[];

  expansionStep = 0;

  @Input() componentInputData: ComponentInputData;
  @Output() verify = new EventEmitter<any>();

  @ViewChildren("calculationValueElement", { read: ElementRef }) calculationValueElements: QueryList<ElementRef>;
  verifyCVCalculationResponse: VerifyCVCalculationResponse;

  calculationDisplayColumns = [
    'beneficiaryNameAndSurname',
    'beneficiaryTypeDescription',
    'empTotal',
    'augTotal',
    'annualEmpPensionString',
    'annualAugPensionString',
    'dateOfBirth',
    'ageString',
    'av',
    'cv'
  ];
  count = 0;
  formUtil = new FormUtil();
  disabledFieldsData: any;
  isLoading: boolean;
  response: VerifyCVCalculationResponse;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private pensCareCvCalculationService: PensCareCvCalculationService,
    private alertService: AlertService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.addFormSubscriptions();
  }


  onLoadLookups(): void {}

  populateModel(): void {
    this.form.patchValue(this.disabledFieldsData);

    const value = this.form.getRawValue();
    if (!this.model) {
      this['model'] = new InitiatePensionCaseData()
    }

    if (this.response == null) {
      this.alertService.loading("CV not verified. Please navigate to Verify CV step then wait for verification to complete")
    } else {
      this.model.pensionCase.verifiedCV = this.response.cvTotal;

      this.model.pensionClaims.forEach((claim, index) => {
        const product = this.verifyCVCalculationResponse.pensionProducts.find(product => product.productCode === claim.productCode);
        this.model.pensionClaims[index].earnings = product.earnings;
      });
      if (this.form.controls['caa']) {
        this.model.pensionCase.caa = this.form.controls['caa'].value;
      }

      this.model.compensationDataSource = this.compensationDataSource;
    }
  }

  populateForm(): void {
    if (this.model && this.model.pensionClaims) {
      let estimatedCV = 0;
      let verifiedCV = 0;
      this.model.pensionClaims.forEach(claim => {

        // form.addControl(`empDescription-${index}`, new FormControl(''));

        this.form.addControl(`${claim.productCode}Earnings` , new UntypedFormControl({value: claim.earnings, disabled: true}));

        this.form.addControl(`${claim.productCode}TotalCompensation`, new UntypedFormControl({value: '', disabled: true}))
        estimatedCV += claim.estimatedCV;
        verifiedCV += claim.verifiedCV;
      })

      this.form.controls[`estimatedCV`].setValue(estimatedCV);
      this.form.controls[`verifiedCV`].setValue(verifiedCV)

      if (this.model.pensionCase.benefitType === BenefitTypeEnum.Disability && this.model.pensionCase.caa !== undefined) {
        this.form.addControl(`caa`, new UntypedFormControl({value: '', disabled: true}));
        this.form.controls['caa'].setValue(this.model.pensionCase.caa);
      }

      this.addFormSubscriptions();
      this.cdr.detectChanges();
      this.disabledFieldsData = this.formUtil.getDisabledFieldsData(this.form);
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  createForm() {
    if (this.form) { return }
    const form = this.formBuilder.group({
      verifiedCV: new UntypedFormControl({ value: '', disabled: true }),
      estimatedCV: new UntypedFormControl({ value: '', disabled: true })
    })

    this.form = form;
  }

  addFormSubscriptions() {
    if (!this.calculationValueElements) return;

    this.calculationValueElements.forEach(calculationValueElement => {
      fromEvent(calculationValueElement.nativeElement, 'keyup').pipe(
        map((e: any) => e.target.value),
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.verifyEstimatedCV();
      })
    })

    this.verifyEstimatedCV();
  }

  setExpansionStep(expansionStep: number) {
    this.expansionStep = expansionStep;
  }

  verifyEstimatedCV() {
    if (!this.model || !this.model.pensionClaims) return;
    this.model.pensionClaims.forEach((claim, index) => {
      this.model.pensionClaims[index].earnings =
        this.form.controls[`${claim.productCode}Earnings`].value == null ?
        0 :
        this.form.controls[`${claim.productCode}Earnings`].value;
    })

    if (this.form.controls['caa']) {
      this.model.pensionCase.caa = this.form.controls['caa'].value
    }

    const verifyEstimatedCVRequest: InitiatePensionCaseData = {
      sourceSystem: this.model.sourceSystem,
      pensionCase: {
        caa: this.model.pensionCase.caa,
        benefitType : this.model.pensionCase.benefitType,
        pdPercentage: this.model.pensionCase.pdPercentage
      },
      pensionClaims: this.model.pensionClaims,
      pensioner: {
        firstName: this.model.pensioner.firstName,
        familyUnit: this.model.pensioner.familyUnit,
        surname: this.model.pensioner.surname,
        beneficiaryType: this.model.pensioner.beneficiaryType,
        idNumber: this.model.pensioner.idNumber,
        dateOfBirth: this.model.pensioner.dateOfBirth,
        gender: this.model.pensioner.gender,
        age: this.model.pensioner.age,
        language : this.model.pensioner.language === LanguageEnum.None ? LanguageEnum.English : this.model.pensioner.language
      },
      beneficiaries: this.model.beneficiaries?.map((beneficiary) => {
        return {
          firstName: beneficiary.firstName,
          familyUnit: beneficiary.familyUnit,
          surname: beneficiary.surname,
          beneficiaryType: beneficiary.beneficiaryType,
          idNumber: beneficiary.idNumber,
          dateOfBirth: beneficiary.dateOfBirth,
          gender: beneficiary.gender,
          age: beneficiary.age,
          isDisabled: beneficiary.isDisabled,
          language : beneficiary.language === LanguageEnum.None ? LanguageEnum.English : beneficiary.language
        }
      }),
      recipients: this.model.recipients?.map((recipient) => {
        return {
          firstName: recipient.firstName,
          familyUnit: recipient.familyUnit,
          surname: recipient.surname,
          beneficiaryType: recipient.beneficiaryType,
          idNumber: recipient.idNumber,
          dateOfBirth: recipient.dateOfBirth,
          gender: recipient.gender,
          age: recipient.age,
          language : recipient.language === LanguageEnum.None ? LanguageEnum.English : recipient.language
        }
      })
    }

    if (this.model.pensionCase.benefitType === BenefitTypeEnum.Fatal) {
      this.isLoading = true;
      this.cdr.detectChanges();
      this.pensCareCvCalculationService.verifyFatalEstimatedCV(verifyEstimatedCVRequest).subscribe(response => {
        this.isLoading = false;
        this.verifyCVCalculationResponse = response;
        this.updateCalculationInputs(response);
      });
    }

    if (this.model.pensionCase.benefitType === BenefitTypeEnum.Disability) {
      this.model.pensionCase.caa = this.form.controls['caa'].value == null ? 0 : this.form.controls['caa'].value;
      this.isLoading = true;
      this.cdr.detectChanges();

      this.pensCareCvCalculationService.verifyDisabilityEstimatedCV(verifyEstimatedCVRequest).subscribe(response => {
        this.isLoading = false;
        this.verifyCVCalculationResponse = response;
        this.updateCalculationInputs(response);
      });
    }
  }

    updateCalculationInputs(response: VerifyCVCalculationResponse) {
        const compensationDataSource: Benefit[] = [];
        let firstProduct: PensionProduct;
        response.pensionProducts.forEach(pensionProduct => {
        if (pensionProduct.benefits.length > 0) {
            pensionProduct.benefits.forEach(benefit => {
            const _benefit = benefit;
            firstProduct = response.pensionProducts.filter(_product => {
                return _product.productCode == benefit.productCode
            })[0];
            _benefit.earnings = firstProduct.earnings;
            compensationDataSource.push(_benefit);
            })
        } else {
            firstProduct = pensionProduct;
        }


        if ( this.form.controls[`${pensionProduct.productCode}TotalCompensation`]) {
            this.form.controls[`${pensionProduct.productCode}TotalCompensation`].setValue(firstProduct.totalCompensation);
        }

        if ( this.form.controls[`${pensionProduct.productCode}Earnings`]) {
            this.form.controls[`${pensionProduct.productCode}Earnings`].setValue(firstProduct.earnings);
        }
        })

        this.compensationDataSource = compensationDataSource;
        this.response = response;
        this.form.controls['verifiedCV'].setValue(response.cvTotal.toFixed(2));
    }
}
