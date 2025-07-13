import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientCover } from '../entities/client-cover';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class ClientCoverService {

    private apiClientCover = 'clc/api/Policy/ClientCover';

    constructor(
        private readonly commonService: CommonService) {
    }

    getClientCoverByClientId(clientId: number): Observable<ClientCover[]> {
        return this.commonService.get<ClientCover[]>(clientId, `${this.apiClientCover}/ByClientId`);
    }

    getClientCoverById(id: number): Observable<ClientCover> {
        return this.commonService.get<ClientCover>(id, `${this.apiClientCover}`);
    }

    getClientCoverByPolicyId(policyId: number): Observable<ClientCover[]> {
        return this.commonService.get<ClientCover[]>(policyId, `${this.apiClientCover}/ByPolicyId`);
    }

    addClientCovers(ClientCovers: ClientCover[]): Observable<number[]> {
        return this.commonService.postGeneric<string, number[]>( `${this.apiClientCover}`, JSON.stringify(ClientCovers));
    }

    getClientCovers(): Observable<ClientCover[]> {
        return this.commonService.getAll<ClientCover[]>(`${this.apiClientCover}`);
    }

    editClientCovers(ClientCovers: ClientCover[]): Observable<boolean> {
        return this.commonService.edit( `${this.apiClientCover}`, JSON.stringify(ClientCovers));
    }

    removeClientCovers(policyId: number): Observable<boolean> {
        return this.commonService.remove(policyId, `${this.apiClientCover}/DeleteByPolicyId`);
    }
}
