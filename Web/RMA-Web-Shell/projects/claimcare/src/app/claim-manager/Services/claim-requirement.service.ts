import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { PersonEventClaimRequirement } from '../shared/entities/person-event-claim-requirement';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { ClaimRequirementCategory } from '../shared/entities/claim-requirement-category';
import { PersonEventModel } from '../shared/entities/personEvent/personEvent.model';
import { ClaimRequirementCategorySearchRequest } from '../shared/entities/claim-requirement-category-search-request';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { AdhocClaimRequirementCommunicationRequest } from '../shared/entities/adhoc-claim-requirement-communication-request';

@Injectable({
  providedIn: 'root'
})
export class ClaimRequirementService {
  private apiUrl = 'clm/api/ClaimRequirement';

  constructor(
    private readonly commonService: CommonService) {
  }


  GetPersonEventRequirements(personEventId: number): Observable<PersonEventClaimRequirement[]> {
    return this.commonService.getAll<PersonEventClaimRequirement[]>(`${this.apiUrl}/GetPersonEventRequirements/${personEventId}`);
  }

  getClaimRequirementCategory(): Observable<ClaimRequirementCategory[]> {
    return this.commonService.getAll<ClaimRequirementCategory[]>(`${this.apiUrl}/GetClaimRequirementCategory`);
  }

  addClaimRequirement(requirement: PersonEventClaimRequirement): Observable<number> {
    return this.commonService.postGeneric<PersonEventClaimRequirement, number>(`${this.apiUrl}/AddClaimRequirement/`, requirement);
  }

  updatePersonEventClaimRequirement(requirement: PersonEventClaimRequirement): Observable<number> {
    return this.commonService.postGeneric<PersonEventClaimRequirement, number>(`${this.apiUrl}/UpdatePersonEventClaimRequirement/`, requirement);
  }

  updatePersonEventClaimRequirements(requirements: PersonEventClaimRequirement[]): Observable<number> {
    return this.commonService.postGeneric<PersonEventClaimRequirement[], number>(`${this.apiUrl}/UpdatePersonEventClaimRequirements/`, requirements);
  }

  getClaimRequirementCategoryLinkedToPersonEvent(personEventId: number): Observable<ClaimRequirementCategory[]> {
    return this.commonService.getAll<ClaimRequirementCategory[]>(`${this.apiUrl}/GetRequirementCategoryPersonEvent/${personEventId}`);
  }

  getPersonEventRequirementByCategoryId(personEventId: number, categoryId: number): Observable<PersonEventClaimRequirement> {
    return this.commonService.getAll<PersonEventClaimRequirement>(this.apiUrl + `/GetPersonEventRequirementByCategoryId/${personEventId}/${categoryId}`);
  }

  getRequirementByDocumentTypeId(personEventId: number, documentType: DocumentTypeEnum): Observable<PersonEventClaimRequirement> {
    return this.commonService.getAll<PersonEventClaimRequirement>(this.apiUrl + `/GetRequirementByDocumentTypeId/${personEventId}/${documentType}`);
  }

  getConfiguredRequirements(personEvent: PersonEventModel): Observable<PersonEventClaimRequirement[]> {
    return this.commonService.postGeneric<PersonEventModel, PersonEventClaimRequirement[]>(`${this.apiUrl}/GetConfiguredRequirements/`, personEvent);
  }

  getPagedClaimRequirementCategory(claimRequirementCategorySearchRequest: ClaimRequirementCategorySearchRequest): Observable<PagedRequestResult<ClaimRequirementCategory>> {
    return this.commonService.postGeneric<ClaimRequirementCategorySearchRequest, PagedRequestResult<ClaimRequirementCategory>>(`${this.apiUrl}/GetPagedClaimRequirementCategory/`, claimRequirementCategorySearchRequest);
  }

  addPersonEventClaimRequirements(personEventClaimRequirements: PersonEventClaimRequirement[]): Observable<number> {
    return this.commonService.postGeneric<PersonEventClaimRequirement[], number>(`${this.apiUrl}/AddPersonEventClaimRequirements/`, personEventClaimRequirements);
  }

  sendAdhocClaimRequirementCommunicationEmail(adhocClaimRequirementCommunicationRequest: AdhocClaimRequirementCommunicationRequest): Observable<number> {
    return this.commonService.postGeneric<AdhocClaimRequirementCommunicationRequest, number>(`${this.apiUrl}/SendAdhocClaimRequirementCommunication`, adhocClaimRequirementCommunicationRequest);
  }

  sendAdhocClaimRequirementCommunicationSms(adhocClaimRequirementCommunicationRequest: AdhocClaimRequirementCommunicationRequest): Observable<number> {
    return this.commonService.postGeneric<AdhocClaimRequirementCommunicationRequest, number>(`${this.apiUrl}/SendAdhocClaimRequirementCommunicationSms`, adhocClaimRequirementCommunicationRequest);
  }
}

