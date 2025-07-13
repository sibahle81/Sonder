import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RolePlayerContact } from 'projects/clientcare/src/app/member-manager/models/roleplayer-contact';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { BehaviorSubject } from 'rxjs';
import { ClaimRequirementService } from '../../../../Services/claim-requirement.service';
import { PersonEventClaimRequirement } from '../../../entities/person-event-claim-requirement';
import { DocumentSetDocumentType } from 'projects/shared-models-lib/src/lib/common/document-set-document-type';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { ClaimAdditionalRequiredDocument } from '../../../entities/claim-additional-required-document';
import { ClaimCareService } from '../../../../Services/claimcare.service';

@Component({
  selector: 'app-request-additional-documents',
  templateUrl: './request-additional-documents.component.html',
  styleUrls: ['./request-additional-documents.component.css']
})
export class RequestAdditionalDocumentsComponent extends UnSubscribe {

  insuredLife: RolePlayer;
  memberId: number;
  personEventId: number;
  form: UntypedFormGroup;
  request: string;
  mainMember: RolePlayer;
  selectedDocumentName: string;
  rolePlayerContacts: RolePlayerContact[] = [];
  claimRequirementCategories: DocumentSetDocumentType[];
  filteredClaimRequirementCategories: DocumentSetDocumentType[] = [];
  claimAdditionalRequiredDocument: ClaimAdditionalRequiredDocument[] = [];
  documentTypeId = DocumentSetEnum.ClaimRequirementsDocuments;
  lookUpSubscription: any;

  memberCommunicationTypes = [CommunicationTypeEnum.Email];
  insuredLifeCommunicationTypes = [CommunicationTypeEnum.Email, CommunicationTypeEnum.SMS];

  memberDesignationTypes = [ContactDesignationTypeEnum.PrimaryContact];
  insuredLifeDesignationTypes = [ContactDesignationTypeEnum.PrimaryContact];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  hasAddPermission = false;

  constructor(
    public dialogRef: MatDialogRef<RequestAdditionalDocumentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly rolePlayerService: RolePlayerService,
    private readonly claimRequirementService: ClaimRequirementService,
    public documentManagementService: DocumentManagementService,
    private readonly claimService: ClaimCareService,
  ) {
    super();
    this.insuredLife = this.data.insuredLife;
    this.memberId = this.data.memberId;
    this.personEventId = this.data.personEventId;
    this.createForm();
    this.getMainMember();
    this.GetClaimRequirementCategory();
  }

  close() {
    this.dialogRef.close();
  }

  createForm() {
    this.form = this.formBuilder.group({
      text: new UntypedFormControl('', [Validators.required]),
      requirementCategoryId: [{ value: null, disabled: false }, Validators.required],
      visibleToMember: [{ value: null, disabled: false }],
      sendCommunication: [{ value: null, disabled: false }],
    });
  }

  readForm() {
    if (!this.form) {
      return;
    }
    this.claimAdditionalRequiredDocument = new Array<ClaimAdditionalRequiredDocument>();
    var additionalRequiredDocument = this.form.controls.requirementCategoryId.value;
    additionalRequiredDocument.forEach(document => {
      this.claimAdditionalRequiredDocument.push(this.claimAdditionalDocument(document));
    });
  }

  claimAdditionalDocument(additionalRequiredDocument): ClaimAdditionalRequiredDocument{
    const document = new ClaimAdditionalRequiredDocument();
 
    document.documentId = additionalRequiredDocument.docTypeId;
    document.documentGroupId = additionalRequiredDocument.documentSet;
    document.personeventId = this.personEventId;
    document.documentName =   additionalRequiredDocument.documentTypeName;
    document.visibleToMember =   this.form.controls.visibleToMember.value != null ? this.form.controls.visibleToMember.value : false;
    document.requestNote = this.form.controls.text.value;
    return document;
  }

  GetClaimRequirementCategory() {
    this.documentManagementService.GetDocumentsTypesByDocumentSet(this.documentTypeId).subscribe(results => {
      this.claimRequirementCategories = results;
      this.filteredClaimRequirementCategories = results;
    });
  }

  onClaimRequirementCategoryChanged(event: any): void {
    const claimRequirementId = this.form.value.id;
    this.selectedDocumentName = event.documentTypeName;
    const claimRequirement = this.claimRequirementCategories.filter(b => b.id === claimRequirementId);
    if (claimRequirement.length > 0) {
      const requirement = claimRequirement[0].id;
      this.form.controls.requirementCategoryId.setValue(requirement);
    }
  }

  onClaimRequirementCategoryKeyChange(value) {
    this.filteredClaimRequirementCategories = this.dropDownSearch(value);
  }

  dropDownSearch(value: string) {
    let filter = value.toLowerCase();
    return this.setData(filter, this.filteredClaimRequirementCategories, this.claimRequirementCategories);
  }

  setData(filter: string, filteredList: any, originalList: any) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    }
    else {
      return filteredList.filter(item => item.documentTypeName.toLocaleLowerCase().includes(filter));
    }
  }

  save() {
    this.readForm();
    this.AddClaimRequirement(this.claimAdditionalRequiredDocument);
  }

  AddRequirement(requirement: PersonEventClaimRequirement) {
    this.isLoading$.next(true);
    this.claimRequirementService.addClaimRequirement(requirement).subscribe(result => {
      if (result) {
        this.isLoading$.next(false);
      }
    })
  }

  AddClaimRequirement(requiredDocuments: ClaimAdditionalRequiredDocument[]) {
    this.isLoading$.next(true);
    this.claimService.AddClaimAdditionalRequiredDocument(requiredDocuments).subscribe((result) => {
      if (result) {
        const data = {
          note: this.claimAdditionalRequiredDocument[0].documentName,
          rolePlayerContacts: this.rolePlayerContacts,
          sendCommunication: this.form.controls.sendCommunication.value
        }
         this.dialogRef.close(data);

        this.isLoading$.next(false);
      }
    });
  }

  setPermissions() {
    this.hasAddPermission = this.userHasPermission('');
  }

  getMainMember() {
    this.rolePlayerService.getRolePlayer(this.memberId).subscribe(result => {
      if (result) {
        this.mainMember = result;
        this.isLoading$.next(false);
      }
    });
  }

  sendCommunication($event: RolePlayerContact[]) {
    $event.forEach(contact => {
      this.rolePlayerContacts.push(contact);
    });
  }
}
