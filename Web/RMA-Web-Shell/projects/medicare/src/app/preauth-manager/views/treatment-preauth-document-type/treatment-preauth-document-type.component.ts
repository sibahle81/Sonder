import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { BehaviorSubject } from 'rxjs';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';

@Component({
  selector: 'app-treatment-preauth-document-type',
  templateUrl: './treatment-preauth-document-type.component.html',
  styleUrls: ['./treatment-preauth-document-type.component.css']
})
export class TreatmentPreauthDocumentTypeComponent {
  @Input() hideTreatmentDocTypeDropdown: boolean = false;
  @Input() linkedId: number = 0;
  @Output() treatmentAuthDocumentsUploadedSetEvent = new EventEmitter<boolean>();
  @Output() treatmentAuthRequiredDocumentsUploadedSetEvent = new EventEmitter<DocumentTypeEnum[]>();
  documentSet: DocumentSetEnum;
  requiredDocumentsUploaded = false;
  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  key: string = 'MedicalTreatmentPreauthDocumentType';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  treatmentAuthDocumentType = new FormControl();
  treatmentAuthDocumentTypes = [
    DocumentSetEnum[DocumentSetEnum.Consultation],
    DocumentSetEnum[DocumentSetEnum.HearingAids],
    DocumentSetEnum[DocumentSetEnum.WoundCare],
    DocumentSetEnum[DocumentSetEnum.BasicRadiology],
    DocumentSetEnum[DocumentSetEnum.SpecializedRadiologyMRICTScanUltrasound],
    DocumentSetEnum[DocumentSetEnum.PhysiotherapyOccupationalTherapy],
    DocumentSetEnum[DocumentSetEnum.AcuteMedication]
  ];
  currentDocument: Document | GenericDocument;
  forceRequiredDocumentTypeFilter: DocumentTypeEnum[];

  constructor(private readonly claimCareService: ClaimCareService, private readonly documentManagementService: DocumentManagementService,
  ) { }

  ngOnInit() {

    this.treatmentAuthDocumentType.valueChanges.subscribe(value => {
      this.getTreatmentTypeSelectedValue(value);
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.linkedId?.currentValue) {
      this.linkedId = changes?.linkedId?.currentValue;
        this.getDocumentByKeyValue(this.linkedId);
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  getTreatmentTypeSelectedValue(value) {
    switch (value) {
      case DocumentSetEnum[DocumentSetEnum.Consultation]:
        this.documentSet = DocumentSetEnum.Consultation;
        this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.TreatmentDoctorsReferral, DocumentTypeEnum.TreatmentMotivationLetter];
        break;
      case DocumentSetEnum[DocumentSetEnum.HearingAids]:
        this.documentSet = DocumentSetEnum.HearingAids;
        this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.HearingaidsQuotation];
        break;
      case DocumentSetEnum[DocumentSetEnum.WoundCare]:
        this.documentSet = DocumentSetEnum.WoundCare;
        this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.WoundcareMotivations, DocumentTypeEnum.WoundcarePrescriptions, DocumentTypeEnum.WoundcarePhotos, DocumentTypeEnum.WoundcareQuotation];
        break;
      case DocumentSetEnum[DocumentSetEnum.BasicRadiology]:
        this.documentSet = DocumentSetEnum.BasicRadiology;
        this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.RadiologyDoctorsReferral, DocumentTypeEnum.RadiologyMotivationLetter, DocumentTypeEnum.RadiologyQuotation];
        break;
      case DocumentSetEnum[DocumentSetEnum.SpecializedRadiologyMRICTScanUltrasound]:
        this.documentSet = DocumentSetEnum.SpecializedRadiologyMRICTScanUltrasound;
        this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.PhysioOTDoctorsPeferral, DocumentTypeEnum.PhysioOTMotivationLetter, DocumentTypeEnum.PhysioOTTreatmentPlan];
        break;
      case DocumentSetEnum[DocumentSetEnum.PhysiotherapyOccupationalTherapy]:
        this.documentSet = DocumentSetEnum.PhysiotherapyOccupationalTherapy;
        this.forceRequiredDocumentTypeFilter = [
          DocumentTypeEnum.RadiologyDoctorsReferral
          , DocumentTypeEnum.RadiologyMotivationLetter
          , DocumentTypeEnum.RadiologyQuotation
          , DocumentTypeEnum.PhysioOTPhotosOfTheWound
          , DocumentTypeEnum.PhysioOTQuotation
          , DocumentTypeEnum.PhysioOTFirstMedicalReport
        ];
        break;
      case DocumentSetEnum[DocumentSetEnum.AcuteMedication]:
        this.documentSet = DocumentSetEnum.AcuteMedication;
        this.forceRequiredDocumentTypeFilter = [DocumentTypeEnum.AcuteMedicationScripts, DocumentTypeEnum.AcuteMedicationScripts];
        break;
      default:
        break;
    }
    this.treatmentAuthRequiredDocumentsUploadedSetEvent.emit(this.forceRequiredDocumentTypeFilter);
  }

  getDocumentByKeyValue(keyValue) {
    this.documentManagementService.getDocumentsByKey(this.key, keyValue).subscribe(result => {
      if (result.length > 0) {
        this.currentDocument = result[0];
        this.documentSet = this.currentDocument.documentSet;
        this.treatmentAuthDocumentType.setValue(this.documentSet);
      }
    });
  }

  isRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded = $event;
    this.treatmentAuthDocumentsUploadedSetEvent.emit($event)
  }

}
