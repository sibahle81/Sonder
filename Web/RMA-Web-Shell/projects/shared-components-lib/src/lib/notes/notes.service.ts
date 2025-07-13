import { Injectable } from '@angular/core';
import { Note } from './note';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { Observable, of } from 'rxjs';

@Injectable()
export class NotesService { 

  constructor(
    private readonly commonService: CommonService) {
  }

  getNote(serviceType: number, id: number): Observable<Note> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.get(id, apiUrl + '/Detail');
  }

  getNotes(serviceType: number, itemType: string, itemId: number): Observable<Note[]> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.getAll<Note[]>(`${apiUrl}/${itemType}/${itemId}`);
  }

  addNote(serviceType: number, note: Note): Observable<number> {   
    if (!note) { return of(0); }
    if (note.text.trim() === '') { return of(0); }
    note.id = 0;
    const apiUrl = this.getApiUrl(serviceType);  
    return this.commonService.postGeneric<Note, number>(`${apiUrl}`, note);
  }

  addNoteWithUrl(apiUrl: string, note: Note): Observable<number> {
    if (!note) { return of(0); }
    if (note.text.trim() === '') { return of(0); }
    note.id = 0;
    return this.commonService.postGeneric<Note, number>(`${apiUrl}`, note);
  }

  editNote(serviceType: number, note: Note): Observable<boolean> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.edit<Note>(note, `${apiUrl}`);
  }

  private getApiUrl(serviceType: number): string {
    switch (serviceType as ServiceTypeEnum) {
      case ServiceTypeEnum.MasterData: return 'mdm/api/Notes';
      case ServiceTypeEnum.Security: return 'sec/api/Notes';
      case ServiceTypeEnum.ProductManager: return 'clc/api/Product/ProductNotes';
      case ServiceTypeEnum.ProductOptionManager: return 'clc/api/Product/ProductOptionNotes';
      case ServiceTypeEnum.BenefitManager: return 'clc/api/Product/BenefitNotes';
      case ServiceTypeEnum.BusinessProcessManager: return 'bpm/api/Notes';
      case ServiceTypeEnum.LeadManager: return 'clc/api/Lead/Notes';
      case ServiceTypeEnum.ClientManager: return 'clc/api/Client/Notes';
      case ServiceTypeEnum.PolicyManager: return 'clc/api/Policy/PolicyNotes';
      case ServiceTypeEnum.BillingManager: return 'fin/api/Billing/Notes';
      case ServiceTypeEnum.CampaignManager: return 'cmp/api/Notes';
      case ServiceTypeEnum.ClaimManager: return 'clm/api/Note';
      case ServiceTypeEnum.BrokerageManager: return 'clc/api/Broker/BrokerageNotes';
      case ServiceTypeEnum.RepresentativeManager: return 'clc/api/Broker/BrokerNotes';
      case ServiceTypeEnum.PaymentManager : return 'fin/api/Note';
      default: return 'bpm/api/Notes';
    }
  }
}
