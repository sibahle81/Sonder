import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { MedicalInvoicesList } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-list';

@Injectable()
export class DataShareService {

  constructor() { }

  public dataChangeMedicalInvoiceDetails = new BehaviorSubject<MedicalInvoicesList[]>([]);

  sendDataMedicalInvoiceDetails(dataChange: any) {
    this.dataChangeMedicalInvoiceDetails.next(dataChange);
  }

  recieveDataMedicalInvoiceDetails(): Observable<any> {
    return this.dataChangeMedicalInvoiceDetails.asObservable();
  }

  public AddBatchInvoiceData = new BehaviorSubject<any>([]);
  sendAddBatchInvoiceData(addBatchInvoiceData: any) {
    this.AddBatchInvoiceData.next(addBatchInvoiceData);
  }

  getItem(key: string) {
    return JSON.parse(sessionStorage.getItem(key));
  }

  setItem<T>(key: string, value: T) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string) {
    sessionStorage.removeItem(key)
  }

}
