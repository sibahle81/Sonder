import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Representative } from '../models/representative';
import { Brokerage } from '../models/brokerage';
import { Product } from '../../product-manager/models/product';
import { PolicyBrokerMoveRequest } from '../../policy-manager/shared/entities/policy-broker-move-request';
import { TargetAudienceMember } from 'projects/admin/src/app/campaign-manager/shared/entities/target-audience-member';

@Injectable()
export class RepresentativeService {

  private apiRepresentative = 'clc/api/Broker/Representative';

  constructor(
    private readonly commonService: CommonService) {
  }

  getRepresentatives(): Observable<Representative[]> {
    return this.commonService.getAll<Representative[]>(`${this.apiRepresentative}`);
  }

  GetBrokersByBrokerageId(brokerId: number): Observable<Representative[]> {
    const url = `${this.apiRepresentative}/GetBrokersByBrokerageId/${brokerId}`;
    return this.commonService.getAll<Representative[]>(url);
  }

  getRepresentative(id: number): Observable<Representative> {
    return this.commonService.get<Representative>(id, `${this.apiRepresentative}`);
  }

  addRepresentative(representative: Representative): Observable<number> {
    return this.commonService.postGeneric<Representative, number>(`${this.apiRepresentative}`,representative);
  }

  editRepresentative(representative: Representative): Observable<boolean> {
    return this.commonService.edit<Representative>(representative, `${this.apiRepresentative}`);
  }

  searchRepresentatives(query: string): Observable<Representative[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<Representative[]>(`${this.apiRepresentative}/SearchBrokers/${urlQuery}`);
  }

  searchNaturalRepresentatives(query: string): Observable<Representative[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<Representative[]>(`${this.apiRepresentative}/SearchNaturalRepresentatives/${urlQuery}`);
  }

  getLastViewedRepresentatives(): Observable<Representative[]> {
    return this.commonService.getAll<Representative[]>(`${this.apiRepresentative}/LastViewed`);
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Representative>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Representative>>(`${this.apiRepresentative}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getJuristicRepresentatives(brokerageIds: number[]): Observable<Representative[]> {
    const brokerages = brokerageIds.map(id => `brokerageId=${id}`).join('&');
    const url = `${this.apiRepresentative}/GetJuristicRepresentatives?${brokerages}`;
    return this.commonService.getAll<Representative[]>(url);
  }

  getAuthorisedRepresentatives(representativeId: number): Observable<Representative[]> {
    const url = `${this.apiRepresentative}/GetBrokersByJuristicRepId/${representativeId}`;
    return this.commonService.getAll<Representative[]>(url);
  }

  GetBrokeragesForRepresentative(representativeId: number): Observable<Brokerage[]> {
    const url = `${this.apiRepresentative}/GetBrokeragesForRepresentative/${representativeId}`;
    return this.commonService.getAll<Brokerage[]>(url);
  }

  // LEGACY
  getBrokers(): Observable<Representative[]> {
    return this.commonService.getAll<Representative[]>(`${this.apiRepresentative}`);
  }

  getBroker(id: number): Observable<Representative> {
    return this.commonService.get<Representative>(id, `${this.apiRepresentative}`);
  }

  addBroker(broker: Representative): Observable<number> {
    return this.commonService.postGeneric<Representative, number>(`${this.apiRepresentative}`, broker);
  }

  editBroker(broker: Representative): Observable<boolean> {
    return this.commonService.edit<Representative>(broker, `${this.apiRepresentative}`);
  }

  searchBrokers(query: string): Observable<Representative[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<Representative[]>(`${this.apiRepresentative}/SearchRepresentatives/${urlQuery}`);
  }

  getLastViewedBrokers(): Observable<Representative[]> {
    return this.commonService.getAll<Representative[]>(`${this.apiRepresentative}/LastViewed`);
  }
  getProductsForRepresentative(representativeId: number, brokerageId: number): Observable<Product[]> {
    return this.commonService.getAll<Product[]>(`${this.apiRepresentative}/GetProductsRepCanSell/${representativeId}/${brokerageId}`);
  }

  getRepresentativesByBrokerageId(brokerId: number): Observable<Representative[]> {
    const url = `${this.apiRepresentative}/GetBrokersByBrokerageId/${brokerId}`;
    return this.commonService.getAll<Representative[]>(url);
  }

  getRepsByBrokerageAndProdutId(brokerId: number, productId: number): Observable<Representative[]> {
    const url = `${this.apiRepresentative}/GetRepsByBrokerageAndProductId/${brokerId}/${productId}`;
    return this.commonService.getAll<Representative[]>(url);
  }

  getBrokeragesEligibleToReceiveRepresentativePolicies(policyMoveRequest: PolicyBrokerMoveRequest): Observable<Brokerage[]> {
    const url = `${this.apiRepresentative}/getBrokeragesEligibleToReceiveRepresentativePolicies`;
    return this.commonService.postGeneric<PolicyBrokerMoveRequest, Brokerage[]>(url,policyMoveRequest);
  }

  isRepAllowedToSellProducts(policyMoveRequest: PolicyBrokerMoveRequest): Observable<boolean> {
    const url = `${this.apiRepresentative}/isRepAllowedToSellProducts`;
    return this.commonService.postGeneric<PolicyBrokerMoveRequest, boolean>(url, policyMoveRequest);
  }

  getInternalAndExternalContactsByRepId(repId: number): Observable<TargetAudienceMember[]> {
    const url = `${this.apiRepresentative}/GetInternalAndExternalContactsByRepId/${repId}`;
    return this.commonService.getAll<TargetAudienceMember[]>(url);
  }

  getJuristicRepresentativesActivePolicies(): Observable<Representative[]> {
    return this.commonService.getAll<Representative[]>(`${this.apiRepresentative}/GetJuristicRepresentativesActivePolicies`);
  }
}
