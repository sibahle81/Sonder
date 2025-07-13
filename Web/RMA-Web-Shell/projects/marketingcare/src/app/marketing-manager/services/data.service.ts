import { Injectable } from '@angular/core';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  currentId: string = null;
  campaignName: string = null;
  campTypeId: number;
  campTypeName: string;
  campaignDetails: any = {};
  campaignId: number = null;
  templateDetails: any | undefined = undefined;
  approverNameList = [];
  campaigTemplate: any = [];

  constructor() { }

  setData(id: string): void{
    this.currentId = id
  }

  getData(): string{
    return this.currentId
  }

  setCampaignNameAndTypeId(cmpName: string,id: number,campTypeName: string, campId: number): void{
    this.campaignName = cmpName;
    this.campTypeId = id;
    this.campTypeName = campTypeName,
    this.campaignId = campId
  }

  getCampaignNameAndTypeId(): any{
    return { 
        name: this.campaignName, 
        campaignMarketingTypeId: this.campTypeId, 
        key: this.campaignName != null ? 'post_create_template' : 'first_template',
        mktCampType: this.campTypeName,
        campaignId: this.campaignId 
      };
    }

  setCampaignDetails(item: any, action: string): void{
    this.campaignDetails = {item: item, action: action};
  }

  getCampaignDetails(): any{
    return this.campaignDetails;
  }

  setTemplateData(item: any): void {
    this.templateDetails = item;
  }

  getTemplateDetails(): any {
    return this.templateDetails;
  }

  setApproverNameList(approverList: any[]): void{
    this.approverNameList = approverList;
  }

  getApproverNameList(): any {
    return this.approverNameList;
  }

  setCampaignTemplateDetails(templeteDetails: any): void{
    this.campaigTemplate.push(templeteDetails);
  }
  
  getCampaignTemplateDetails(): any{
    return this.campaigTemplate;
  }

}
