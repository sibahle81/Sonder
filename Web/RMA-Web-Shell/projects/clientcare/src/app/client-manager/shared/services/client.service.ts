import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Client } from '../Entities/client';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable()
export class ClientService {

  private apiClient = 'clc/api/Client/Client';
  private apiClientSubsidiary = 'clc/api/Client/ClientSubsidiary';

  constructor(
    private readonly commonService: CommonService) {
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Client>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Client>>(`${this.apiClient}/ClientSearch/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
}

  getLastViewedClients(): Observable<Client[]> {
    return this.commonService.getAll<Client[]>(`${this.apiClient}/LastViewed`);
  }

  getClients(): Observable<Client[]> {
    return this.commonService.getAll<Client[]>(`${this.apiClient}`);
  }

  getClient(id: number): Observable<Client> {
    if (!id) { return of<Client>(); }
    return this.commonService.get<Client>(id, `${this.apiClient}`);
  }

  addClient(client: Client): Observable<number> {
    return this.commonService.postGeneric<Client, number>(`${this.apiClient}`, client);
  }

  editClient(client: Client): Observable<boolean> {
    return this.commonService.edit<Client>(client, `${this.apiClient}`);
  }

  getAvailableClientSubsidiaries(): Observable<Client[]> {
    return this.commonService.getAll<Client[]>(`${this.apiClientSubsidiary}`);
  }

  getClientSubsidiaries(clientId: number): Observable<Client[]> {
    return this.commonService.get<Client[]>(clientId, `${this.apiClient}/GetClientSubsidiariesIds`);
  }

  editClientSubsidiary(clientId: number, parentClientId: number): Observable<boolean> {
    const client = new Client();
    client.id = clientId;
    client.parentClientId = parentClientId;

    return this.commonService.edit<Client>(client, `${this.apiClient}`);
  }

  removeClient(id: number): Observable<boolean> {
    return this.commonService.remove(id, `${this.apiClient}`);
  }

  editClientBank(clientId: number, bankId: number): Observable<boolean> {
    const client = new Client();
    client.id = clientId;
    client.bankAccountId = bankId;

    return this.commonService.edit<Client>(client, `${this.apiClient}`);
  }

  getClientGroups(clientId: number): Observable<Client[]> {
    return this.commonService.get<Client[]>(clientId, `${this.apiClient}/GetGroupsForClient`);
  }

}
