import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { MessageContent } from '../entities/message-content';
import { Template } from '../entities/template';
import { Token } from '../entities/token';

@Injectable()
export class TemplateService {

  apiLastViewed = 'cmp/api/LastViewed';

  constructor(
    private readonly commonService: CommonService) {
  }

  private apiTemplate(controller: string): string {
    return `cmp/api/${controller}Template`;
  }

  private apiToken(controller: string): string {
    return `cmp/api/${controller}Token`;
  }

  private api(controller: string): string {
    return `cmp/api/${controller}`;
  }

  getValidTemplateTypes(): Lookup[] {
    return [
      { id: 1, name: 'Email', category: '', code: '', skillSubCategoryId: 0, isChecked: false, universalBranchCode: '' },
      { id: 2, name: 'Text message', category: '', code: '', skillSubCategoryId: 0, isChecked: false, universalBranchCode: '' }
    ];
  }

  getTemplates(api: string, category: string): Observable<Template[]> {
    let url = this.apiTemplate(api);
    if (category !== '') {
      url += `/${category}`;
    }
    return this.commonService.getAll<Template[]>(url);
  }

  searchTemplates(api: string, query: string) {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<Template[]>(`${this.apiTemplate(api)}/Search/${urlQuery}`);
  }

  getLastViewedTemplates(): Observable<Template[]> {
    return this.commonService.getAll<Template[]>(`${this.apiLastViewed}/Templates`);
  }

  getCampaignTemplates(api: string, campaignId: number): Observable<Template[]> {
    return this.commonService.getAll<Template[]>(`${this.apiTemplate(api)}/Campaign/${campaignId}`);
  }

  getTemplate(api: string, templateId: number): Observable<Template> {
    const url = `${this.apiTemplate(api)}/ById`;
    return this.commonService.get<Template>(templateId, url);
  }

  addTemplate(api: string, template: Template): Observable<number> {
    return this.commonService.postGeneric<Template,number>(this.apiTemplate(api), template);
  }

  editTemplate(api: string, template: Template): Observable<boolean> {
    return this.commonService.edit<Template>(template, this.apiTemplate(api));
  }

  loadTokens(api: string, id: number): Observable<Token[]> {
    return this.commonService.getAll<Token[]>(`${this.apiToken(api)}/${id}`);
  }

  saveTokens(api: string, tokens: Token[]): Observable<boolean> {
    return this.commonService.editMultiple<Token>(tokens, this.apiToken(api));
  }

  deleteTokens(api: string, id: number): Observable<number> {
    return this.commonService.remove<number>(id, this.apiToken(api));
  }

  getMessageContent(api: string, id: number): Observable<MessageContent> {
    return this.commonService.get(id, `${this.api(api)}/GetContent/ById`);
  }
}
