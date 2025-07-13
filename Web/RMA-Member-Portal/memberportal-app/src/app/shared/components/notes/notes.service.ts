import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ServiceType } from '../../enums/service-type.enum';
import { Note } from '../../models/note.model';
import 'rxjs/add/observable/of';


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
    if (!note) { return Observable.of(0); }
    if (note.text.trim() === '') { return Observable.of(0); }
    note.id = 0;
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.add<Note>(note, `${apiUrl}`);
  }

  addNoteWithUrl(apiUrl: string, note: Note): Observable<number> {
    if (!note) { return Observable.of(0); }
    if (note.text.trim() === '') { return Observable.of(0); }
    note.id = 0;
    return this.commonService.add<Note>(note, `${apiUrl}`);
  }

  editNote(serviceType: number, note: Note): Observable<boolean> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.edit<Note>(note, `${apiUrl}`);
  }

  private getApiUrl(serviceType: number): string {
    switch (serviceType as ServiceType) {
      case ServiceType.MasterData: return 'mdm/api/Notes';
      case ServiceType.Security: return 'sec/api/Notes';
      case ServiceType.ProductManager: return 'clc/api/Product/ProductNotes';
      case ServiceType.ProductOptionManager: return 'clc/api/Product/ProductOptionNotes';
      case ServiceType.BenefitManager: return 'clc/api/Product/BenefitNotes';
      case ServiceType.BusinessProcessManager: return 'bpm/api/Notes';
      case ServiceType.LeadManager: return 'clc/api/Lead/Notes';
      case ServiceType.ClientManager: return 'clc/api/Client/Notes';
      case ServiceType.PolicyManager: return 'clc/api/Policy/PolicyNotes';
      case ServiceType.BillingManager: return 'fin/api/Billing/Notes';
      case ServiceType.CampaignManager: return 'cmp/api/Notes';
      case ServiceType.ClaimManager: return 'clm/api/Note';
      case ServiceType.BrokerageManager: return 'clc/api/Broker/BrokerageNotes';
      case ServiceType.RepresentativeManager: return 'clc/api/Broker/BrokerNotes';
      default: return 'bpm/api/Notes';
    }
  }
}
