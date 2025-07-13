import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { ProstheticQuotationTypeEnum } from '../../../medi-manager/enums/prosthetic-quotation-type-enum';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { BehaviorSubject } from 'rxjs';
import { ProstheticDocumentStates } from '../../models/prosthetic-document-states';

@Component({
  selector: 'app-prosthetic-quotation-type',
  templateUrl: './prosthetic-quotation-type.component.html',
  styleUrls: ['./prosthetic-quotation-type.component.css']
})
export class ProstheticQuotationTypeComponent implements OnInit, OnChanges {

  @Input() claimId: number;
  @Input() preAuthId: number;
  @Input() hideQuotationTypeDropdown: boolean = false;
  @Input() quotationTypeDocsType: ProstheticQuotationTypeEnum;
  @Input() isWizard: boolean = false;
  @Input() isReadOnly: boolean = false;
  @Input() disableQuotationTypeForProstheticView: boolean = false;
  @Output() prostheticQuotationTypeSetEvent = new EventEmitter<ProstheticQuotationTypeEnum>();
  @Output() prostheticDocumentStatesSetEvent = new EventEmitter<ProstheticDocumentStates>();
  @Output() prostheticDocumentsUploadedSetEvent = new EventEmitter<boolean>();
  prostheticQuotationType = new FormControl();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  prostheticDocumentStates: ProstheticDocumentStates

  documentSet: DocumentSetEnum;
  requiredDocumentsUploaded = false;
  documentSystemName = DocumentSystemNameEnum.MediCareManager;

  selectedQuotationType: number = undefined;
  key: string;
  differenceInDays: number

  ngOnChanges(changes: SimpleChanges) {

    if (this.claimId) {
      this.getClaimDetails(this.claimId)
    }
    if (this.preAuthId) {
      this.setlinkedItemId(this.preAuthId)
    }
    if (this.hideQuotationTypeDropdown) {
      this.hideQuotationTypeDropdown = this.hideQuotationTypeDropdown
    }

  }

  prostheticQuotationTypes: ProstheticQuotationTypeEnum[];
  linkedId: number = 0;
  claimData: Claim

  constructor(private readonly claimCareService: ClaimCareService,
  ) { }

  ngOnInit() {

    this.prostheticQuotationTypes = MedicareUtilities.getLookups(ProstheticQuotationTypeEnum).
    filter((x) => x !== ProstheticQuotationTypeEnum[ProstheticQuotationTypeEnum.Unspecified]);

    if (!this.quotationTypeDocsType) {
      this.prostheticQuotationType.valueChanges.subscribe(value => {
        this.prostheticQuotationTypeSetEmitter(value as ProstheticQuotationTypeEnum)

      });
    }
    else{
      this.setProstheticQuotationTypeDefault(this.quotationTypeDocsType);
    }

  }

  setProstheticQuotationTypeDefault(prostheticQuotationTypeDefault) {
    this.prostheticQuotationType.setValue(ProstheticQuotationTypeEnum[prostheticQuotationTypeDefault]);
    if(this.disableQuotationTypeForProstheticView){
      this.disableProstheticQuotationTypeCheck(true);
    }    
  }

  getClaimDetails(claimId) {
    this.claimCareService.GetClaim(claimId).subscribe(result => {
      this.claimData = result;

      if (this.quotationTypeDocsType && claimId > 0) {
        this.getProstheticQuotationTypeSelectedValue(this.quotationTypeDocsType)
      }

      if(!this.disableQuotationTypeForProstheticView && this.quotationTypeDocsType){
        let defaultProstheticType : any = ProstheticQuotationTypeEnum[this.quotationTypeDocsType];
        this.prostheticQuotationTypeSetEmitter(defaultProstheticType);

        this.prostheticQuotationType.valueChanges.subscribe(value => {
          this.prostheticQuotationTypeSetEmitter(value as ProstheticQuotationTypeEnum);
        });
      }
      
      this.isLoading$.next(false);
    });

  }

  setlinkedItemId(preAuthId) {
    this.linkedId = !isNullOrUndefined(preAuthId) && preAuthId > 0 ? preAuthId : null;
  }

  prostheticQuotationTypeSetEmitter(value: ProstheticQuotationTypeEnum) {
    this.getProstheticQuotationTypeSelectedValue(value)
    this.prostheticDocumentStatesSetter(value)
    this.prostheticQuotationTypeSetEvent.emit(value)

  }

  prostheticDocumentStatesSetter(val) {
    val = MedicareUtilities.getProstheticQuotationTypeEnumId(val)

    this.prostheticDocumentStates = {
      ProstheticOrthoticDocsOver2YrsNonPension: ((val == ProstheticQuotationTypeEnum.ProstheticOrthotic || val == ProstheticQuotationTypeEnum.Prosthetic) &&
        this.claimData.disabilityPercentage <= 30 && this.differenceInDays < 730) ? true : false,
      OrthoticDocsOver2YrsNonPension: val == ProstheticQuotationTypeEnum.Orthotic ? true : false,
      ProstheticDocsOver2YrsPension: (val == ProstheticQuotationTypeEnum.Prosthetic &&
        this.claimData.disabilityPercentage > 30 && this.differenceInDays >= 730) ? true : false,
      selectedQuotationType: val
    }
    this.prostheticDocumentStatesSetEvent.emit(this.prostheticDocumentStates)
  }

  disableProstheticQuotationTypeCheck(disableValue: boolean) {
    if (isNullOrUndefined(disableValue) || disableValue != true) {
      this.prostheticQuotationType.enable()
    }
    else {
      this.prostheticQuotationType.disable()
    }

  }

  getProstheticQuotationTypeSelectedValue(value) {
    this.selectedQuotationType = (typeof (value) == "string") ? MedicareUtilities.getProstheticQuotationTypeEnumId(value) : Number(value);

    this.differenceInDays = MedicareUtilities.getDiffDays(new Date(this.claimData?.createdDate), new Date());

    //under 2 years/ over 2 years non pension cases by DisabilityPercentage
    if (this.claimData?.disabilityPercentage <= 30 && this.differenceInDays < 730) {

      if (ProstheticQuotationTypeEnum.Orthotic == this.selectedQuotationType) {
        //only quote and referal
        this.documentSet = DocumentSetEnum.MedicalOrthoticDocsOver2YrsNonPension;
        this.key = 'MedicalProstheticOrthoticDocsOver2YrsNonPension'
      }
      else if (ProstheticQuotationTypeEnum.Prosthetic == this.selectedQuotationType) {
        //3 docs, Coid Form, quote and referal
        this.documentSet = DocumentSetEnum.MedicalProstheticOrthoticDocsOver2YrsNonPension;
        this.key = 'MedicalOrthoticDocsOver2YrsNonPension'
      }
      else if (ProstheticQuotationTypeEnum.ProstheticOrthotic == this.selectedQuotationType) {
        //3 docs, Coid Form, quote and referal
        this.documentSet = DocumentSetEnum.MedicalProstheticOrthoticDocsOver2YrsNonPension;
        this.key = 'MedicalOrthoticDocsOver2YrsNonPension'
      }
    }
    //over 2 years:pension cases by DisabilityPercentage
    else if (this.claimData?.disabilityPercentage > 30 && this.differenceInDays >= 730) {

      if (ProstheticQuotationTypeEnum.Prosthetic == this.selectedQuotationType) {
        //only quote 
        this.documentSet = DocumentSetEnum.MedicalProstheticDocsOver2YrsPension;
        this.key = 'MedicalProstheticDocsOver2YrsPension'
      }
    }
  }

  isRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded = $event;
    this.prostheticDocumentsUploadedSetEvent.emit($event)
  }

  formatLookup(lookup: string): string {
    //format enum values for HTML display purposes example: ChronicMedication to Chronic Medication
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

}

