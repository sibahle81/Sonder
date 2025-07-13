import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PersonEventClaimRequirement } from '../../entities/person-event-claim-requirement';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentsRequest } from 'projects/shared-components-lib/src/lib/document-management/documents-request';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DiseaseTypeEnum } from '../../enums/disease-type-enum';
import { RequestAdditionalDocumentsComponent } from '../claim-holistic-view/request-additional-documents/request-additional-documents.component';
import { MatDialog } from '@angular/material/dialog';
import { AdditionalDocumentRequest } from '../../entities/additional-document-request';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimEarningService } from '../../../Services/claim-earning.service';
import { DaysCountEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/days-count-enum';
import { EventModel } from '../../entities/personEvent/event.model';
import { ClaimRequirementService } from '../../../Services/claim-requirement.service';
import { AdditionalDocumentsComponent } from '../additional-documents/additional-documents.component';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { ClaimAdditionalRequiredDocument } from '../../entities/claim-additional-required-document';

@Component({
  selector: 'claim-requirements-view',
  templateUrl: './claim-requirements-view.component.html',
  styleUrls: ['./claim-requirements-view.component.css']
})
export class ClaimRequirementsViewComponent extends UnSubscribe implements OnChanges {

  acknowledgeClaimPermission = 'Acknowledge Claim';
  acceptClaimLiabilityPermission = 'Accept Claim Liability';
  repudiateClaimLiabilityPermission = 'Repudiate Claim Liability';

  //required
  @Input() event: EventModel;
  @Input() personEvent: PersonEventModel;

  //optional
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() triggerRefresh: boolean;

  @ViewChild(AdditionalDocumentsComponent, { static: false }) updateAdditionalDocuments: AdditionalDocumentsComponent;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isAdditionalRequiredDocumentsLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading requirements...please wait');

  personEventClaimRequirements: PersonEventClaimRequirement[] = [];
  documentRequest: DocumentsRequest;

  documentsReceived: Document[];
  documentExist: string;
  selectedPersonEventClaimRequirement: PersonEventClaimRequirement;
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  documentUploadStatus = DocumentStatusEnum.Accepted;
  documentFilter: DocumentTypeEnum[];
  additionalRequiredDocuments: ClaimAdditionalRequiredDocument[] = [];

  constructor(
    private readonly claimRequirementService: ClaimRequirementService,
    private readonly claimService: ClaimCareService,
    private readonly documentService: DocumentManagementService,
    private readonly alertService: ToastrManager,
    protected claimEarningService: ClaimEarningService,
    private readonly dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getPersonEventRequirements();
  }

  getPersonEventRequirements() {
    this.isLoading$.next(true);
    this.loadingMessages$.next('loading requirements...please wait');
    this.claimRequirementService.GetPersonEventRequirements(this.personEvent.personEventId).subscribe(results => {
      if (results && results.length > 0) {
        this.personEventClaimRequirements = results.filter(item => item.claimRequirementCategoryId !== DocumentSetEnum.NIHLRequireRetest);
      }
      this.isLoading$.next(false);
    });
  }

  uploadRequiredDocument($event: PersonEventClaimRequirement) {
    this.selectedPersonEventClaimRequirement = $event;
    this.documentFilter = [$event.claimRequirementCategory.documentType];
  }

  deleteRequirement($event: PersonEventClaimRequirement) {
    this.selectedPersonEventClaimRequirement = $event;
    this.selectedPersonEventClaimRequirement.isDeleted = true;
    this.loadingMessages$.next('deleting requirement....please wait'); 
    this.claimRequirementService.updatePersonEventClaimRequirement(this.selectedPersonEventClaimRequirement).subscribe(results => {
      this.reset();
      this.isLoading$.next(false);
    });
  }

  requiredDocumentsUploaded($event: boolean) {
    if (!$event) {
      this.selectedPersonEventClaimRequirement.dateClosed = null;
    }
    else {
      this.selectedPersonEventClaimRequirement.dateClosed = new Date().getCorrectUCTDate();
    }
    this.claimRequirementService.updatePersonEventClaimRequirement(this.selectedPersonEventClaimRequirement).subscribe(_ => { });
  }

  getAdditionalRequiredDocuments() {
    this.isAdditionalRequiredDocumentsLoading$.next(true);
    this.claimService.GetClaimAdditionalRequiredDocument(this.personEvent.personEventId).subscribe(results => {
      this.additionalRequiredDocuments = results;
      this.isAdditionalRequiredDocumentsLoading$.next(false);
    });
  }

  getDocumentKeys(): { [key: string]: string } {
    return { PersonEvent: `${this.personEvent.personEventId}` };
  }

  selectionChange() {
    if (this.personEvent.personEventDiseaseDetail !== null) {
      switch (this.personEvent.personEventDiseaseDetail.typeOfDisease) {
        case DiseaseTypeEnum.NIHL:
          this.personEvent.documentSetEnum = DocumentSetEnum.NIHL;
          break;
        case DiseaseTypeEnum.WorkRelatedUpperLimbDisorder:
          this.personEvent.documentSetEnum = DocumentSetEnum.WRULDdocuments;
          break;
        case DiseaseTypeEnum.TuberculosisHealthWorkersOnly:
        case DiseaseTypeEnum.TuberculosisOfTheHeart:
        case DiseaseTypeEnum.TuberculousPleurisy:
        case DiseaseTypeEnum.PulmonaryTuberculosisPlusOAD:
        case DiseaseTypeEnum.PulmonaryTuberculosis:
        case DiseaseTypeEnum.PulmonaryTuberculosisPlusPneumoconiosis:
        case DiseaseTypeEnum.PulmonaryTuberculosisPlusPneumoconiosisPlusOAD:
          this.personEvent.documentSetEnum = DocumentSetEnum.TuberculosisDocuments;
          break;
        case DiseaseTypeEnum.PTSD:
          this.personEvent.documentSetEnum = DocumentSetEnum.PtsdDocuments;
          break;
        case DiseaseTypeEnum.Malaria:
          this.personEvent.documentSetEnum = DocumentSetEnum.MalariaDocuments;
          break;
        case DiseaseTypeEnum.Virus:
          this.personEvent.documentSetEnum = DocumentSetEnum.CovidDocuments;
          break;
        case DiseaseTypeEnum.HeatExhaustionHeatStroke:
          this.personEvent.documentSetEnum = DocumentSetEnum.HeatClaimsDocuments;
          break;
        case DiseaseTypeEnum.OccupationalAsthma:
          this.personEvent.documentSetEnum = DocumentSetEnum.AsthmaDocuments;
          break;
        default:
          this.personEvent.documentSetEnum = DocumentSetEnum.ClaimDiseaseNotificationID;
          break;
      }

      this.documentRequest = new DocumentsRequest();
      this.documentRequest.documentSet = this.personEvent.documentSetEnum;
      this.documentRequest.keys = this.getDocumentKeys();

      this.documentService.GetDocumentsBySetAndKey(this.documentRequest).subscribe(documents => {
        this.documentsReceived = documents;
        if (documents) {
          documents.forEach(document => {
            const personIdentificationType = this.personEvent.rolePlayer?.person?.idType;
            if (personIdentificationType === IdTypeEnum.Passport_Document && (document.docTypeId) !== DocumentTypeEnum.IDCopy) {
              this.documentExist = document.documentUri;
            }
          });
        }
      });
    }
  }

  requestAdditionalDocuments() {
    const dialogRef = this.dialog.open(RequestAdditionalDocumentsComponent, {
      width: '1200px',
      maxHeight: '600px',
      data: {
        insuredLife: this.personEvent.rolePlayer,
        memberId: this.personEvent.companyRolePlayerId,
        personEventId: this.personEvent.personEventId
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        if (data.sendCommunication) {
          this.isLoading$.next(true);
          this.loadingMessages$.next('sending notifications....please wait');

          const additionalDocumentRequest = new AdditionalDocumentRequest();
          additionalDocumentRequest.rolePlayerContacts = data.rolePlayerContacts;
          additionalDocumentRequest.note = data.note;
          additionalDocumentRequest.personEventId = this.personEvent.personEventId;
          additionalDocumentRequest.reason = 'Additional Documents Requested';
          additionalDocumentRequest.thirdDocumentsFollowUpDayCount = DaysCountEnum.ThirdDocumentsFollowUp;

          this.claimService.sendAdditionalDocumentsRequest(additionalDocumentRequest).subscribe(result => {
            if (result) {
              this.alertService.successToastr('notification has been sent successfully');
              this.selectionChange()
              this.getPersonEventRequirements();
              this.getAdditionalRequiredDocuments();
              this.isLoading$.next(false);
            }
          })
        } else {
          this.selectionChange()
          this.getPersonEventRequirements();
          this.getAdditionalRequiredDocuments();
        }
      }
    });
  }

  reset() {
    this.selectedPersonEventClaimRequirement = null;
  }

  refresh() {
    this.getPersonEventRequirements();
  }
}