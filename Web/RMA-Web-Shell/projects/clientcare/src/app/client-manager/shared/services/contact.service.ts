import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Contact } from '../Entities/contact';

@Injectable()
export class ContactService {

    private apiContact = 'clc/api/Client/Contact';

    constructor(private readonly commonService: CommonService) {
    }

    listContacts(): Observable<Contact[]> {
        return this.commonService.getAll<Contact[]>(`${this.apiContact}`);
    }

    getContact(id: number): Observable<Contact> {
        return this.commonService.get<Contact>(id, `${this.apiContact}`);
    }

    getContacts(id: number): Observable<Contact[]> {
        return this.commonService.get<Contact[]>(id, `${this.apiContact}/GetContacts`);
    }

    addMultipleContact(contacts: Contact[]): Observable<number> {
        return this.commonService.postGeneric<Contact[], number>(`${this.apiContact}`, contacts);
    }

    addContact(contact: Contact): Observable<number> {
        return this.commonService.postGeneric<Contact, number>(`${this.apiContact}`, contact);
    }

    editContact(contact: Contact): Observable<boolean> {
        return this.commonService.edit<Contact>(contact, `${this.apiContact}`);
    }

    removeContact(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiContact}`);
    }

    getContactByItemType(itemType: string , itemId: number): Observable<Contact[]> {
        const apiUrl = `${this.apiContact}/GetContactsByItemType/${itemType}/${itemId}`;
        return this.commonService.getAll<Contact[]>(apiUrl);
    }
}
