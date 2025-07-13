import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


import { Address } from '../Entities/address';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class AddressService {
    private apiAddresss = 'clc/api/Client/Address';
    constructor(
        private readonly commonService: CommonService) {
    }

    getAddress(id: number): Observable<Address> {
        return this.commonService.get<Address>(id, `${this.apiAddresss}`);
    }

    getAllAddressesForClient(clientId: number): Observable<Address[]> {
        return this.commonService.get<Address[]>(clientId, `${this.apiAddresss}/GetAllAddressesForClient`);
    }

    addAddress(address: Address): Observable<number> {
        return this.commonService.postGeneric<Address, number>(`${this.apiAddresss}`, address);
    }

    editAddress(address: Address): Observable<boolean> {
        return this.commonService.edit<Address>(address, `${this.apiAddresss}`);
    }

    removeAddress(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiAddresss}`);
    }
}
