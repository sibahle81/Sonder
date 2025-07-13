import { Component, OnInit, AfterViewChecked, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { Token } from 'projects/admin/src/app/campaign-manager/shared/entities/token';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';
import { CampaignSms } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign-sms';
import { CampaignEmail } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign-email';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';
import { TemplateService } from 'projects/admin/src/app/campaign-manager/shared/services/template-service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CampaignStatus } from 'projects/admin/src/app/campaign-manager/views/campaign-review/campaign-status';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  styleUrls: ['./campaign-template.component.css'],
  templateUrl: './campaign-template.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'campaign-template',
  encapsulation: ViewEncapsulation.None
})
export class CampaignTemplateComponent implements OnInit, AfterViewChecked {

  campaign: Campaign;

  isLoading = false;
  hasTemplate = false;
  canAdd: boolean;
  canEdit: boolean;

  itemStyle: string;
  saveStyle: string;
  templateId: number;
  messageId: number;
  templates: any[];
  blankTemplate: string;
  template: any;
  tokens: Token[];

  token: string;
  tokenValue = '';
  link: string;
  linkValue = '';

  showEditBox = false;
  linkSelected = false;

  get showEditButtons(): boolean {
    return this.canAdd || this.canEdit;
  }

  get hasLoaded(): boolean {
    return this.template || this.templates;
  }

  get isEmailCampaign(): boolean {
    if (this.campaign) {
      return this.campaign.campaignType === 1;
    }
    return false;
  }

  get isSmsCampaign(): boolean {
    if (this.campaign) {
      return this.campaign.campaignType === 2;
    }
    return false;
  }

  constructor(
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly campaignService: CampaignService,
    private readonly templateService: TemplateService,
    private readonly authService: AuthService,
    private readonly appEventsManager: AppEventsManager
  ) {
  }

  ngOnInit(): void {
    this.setPermissions();
  }

  ngAfterViewChecked(): void {
    this.resizeContainers();
  }

  setPermissions(): void {
    this.canAdd = userUtility.hasPermission('Add Campaign');
    this.canEdit = userUtility.hasPermission('Edit Campaign');
  }

  getTemplates(campaign: Campaign): void {
    if (campaign) {
      if (!this.hasLoaded) {
        this.isLoading = true;
        this.showEditBox = false;
        this.campaign = campaign;
        switch (campaign.campaignType) {
          case 1:
            this.itemStyle = 'grid-email-item';
            this.loadEmailTemplates();
            break;
          case 2:
            this.itemStyle = 'grid-sms-item';
            this.loadSmsTemplates();
            break;
          default:
            this.isLoading = false;
        }
      }
    }
  }

  loadEmailTemplates(): void {
    if (this.campaign.campaignEmails && this.campaign.campaignEmails.length > 0) {
      this.loadSingleEmailTemplate(this.campaign.campaignEmails[0]);
    } else {
      this.loadAllEmailTemplates();
    }
  }

  loadSmsTemplates(): void {
    if (this.campaign.campaignSmses && this.campaign.campaignSmses.length > 0) {
      this.loadSingleSmsTemplate(this.campaign.campaignSmses[0]);
    } else {
      this.loadAllSmsTemplates();
    }
  }

  loadAllEmailTemplates(): void {
    this.clearTemplates();
    this.templateService.getTemplates('Email', 'Marketing').subscribe(
      data => {
        this.templates = data;
        this.isLoading = false;
      }
    );
  }

  loadSingleEmailTemplate(campaignEmail: CampaignEmail): void {
    this.clearTemplates();
    this.templateService.getTemplate('Email', campaignEmail.templateId).subscribe(
      data => {
        this.template = data;
        this.blankTemplate = this.template.template;
        this.messageId = campaignEmail.id;
        this.getEmailTokens(campaignEmail.id);
        this.hasTemplate = true;
        this.isLoading = false;
      }
    );
  }

  getEmailTokens(id: number): void {
    this.templateService.loadTokens('Email', id).subscribe(
      data => {
        this.tokens = data;
        this.loadTokens();
      }
    );
  }

  loadTokens(): void {
    if (!this.template) { return; }
    if (!this.tokens || this.tokens.length === 0) { return; }
    for (const token of this.tokens) {
      const tokenKey = '[' + token.tokenKey + ']';
      this.template.template = this.template.template.replace(tokenKey, token.tokenValue);
    }
  }

  loadAllSmsTemplates(): void {
    this.clearTemplates();
    this.templateService.getTemplates('Sms', 'Marketing').subscribe(
      data => {
        this.templates = data;
        this.isLoading = false;
      }
    );
  }

  loadSingleSmsTemplate(campaignSms: CampaignSms): void {
    this.clearTemplates();
    this.templateService.getTemplate('Sms', campaignSms.templateId).subscribe(
      data => {
        this.template = data;
        this.blankTemplate = this.template.template;
        this.messageId = campaignSms.id;
        this.getSmsTokens(campaignSms.id);
        this.hasTemplate = true;
        this.isLoading = false;
      }
    );
  }

  getSmsTokens(id: number): void {
    this.templateService.loadTokens('Sms', id).subscribe(
      data => {
        this.tokens = data;
        this.loadTokens();
      }
    );
  }

  clearTemplates(): void {
    this.template = null;
    this.templates = null;
  }

  reloadTemplate(): void {
    this.clearTemplates();
    this.getTemplates(this.campaign);
  }

  selectTemplate(): void {
    if (this.templateId) {
      switch (this.campaign.campaignType) {
        case 1:
          this.saveEmailTemplate();
          break;
        case 2:
          this.saveSmsTemplate();
          break;
      }
    }
  }

  saveEmailTemplate(): void {
    this.appEventsManager.loadingStart('Saving campaign template...');
    if (this.campaign.campaignEmails && this.campaign.campaignEmails.length > 0) {
      this.campaign.campaignEmails[0].templateId = this.templateId;
      this.campaign.campaignEmails[0].modifiedBy = this.authService.getUserEmail();
      this.campaign.campaignEmails[0].modifiedDate = new Date();
    } else {
      this.campaign.campaignEmails.push(this.getNewEmailTemplate());
    }
    this.editCampaign();
  }

  saveSmsTemplate(): void {
    this.appEventsManager.loadingStart('Saving campaign template...');
    if (this.campaign.campaignSmses && this.campaign.campaignSmses.length > 0) {
      this.campaign.campaignSmses[0].templateId = this.templateId;
      this.campaign.campaignSmses[0].modifiedBy = this.authService.getUserEmail();
      this.campaign.campaignSmses[0].modifiedDate = new Date();
    } else {
      this.campaign.campaignSmses.push(this.getNewSmsTemplate());
    }
    this.editCampaign();
  }

  editCampaign(): void {
    this.campaign.campaignStatus = CampaignStatus.Updated;
    this.campaignService.editCampaign(this.campaign).subscribe(
      () => {
        this.campaignService.getCampaign(this.campaign.id).subscribe(
          data => {
            this.campaign = data;
            this.reloadTemplate();
            this.appEventsManager.loadingStop();
          }
        );
      }
    );
  }

  getNewEmailTemplate(): CampaignEmail {
    const email = new CampaignEmail();
    email.id = 0;
    email.campaignId = this.campaign.id;
    email.templateId = this.templateId;
    email.isActive = true;
    email.isDeleted = false;
    email.createdBy = this.authService.getUserEmail();
    email.createdDate = new Date();
    email.modifiedBy = email.createdBy;
    email.modifiedDate = email.createdDate;
    return email;
  }

  getNewSmsTemplate(): CampaignSms {
    const sms = new CampaignSms();
    sms.id = 0;
    sms.campaignId = this.campaign.id;
    sms.templateId = this.templateId;
    sms.isActive = true;
    sms.isDeleted = false;
    sms.createdBy = this.authService.getUserEmail();
    sms.createdDate = new Date();
    sms.modifiedBy = sms.createdBy;
    sms.modifiedDate = sms.createdDate;
    return sms;
  }

  setSelectedTemplate(item: any): void {
    this.templateId = item.value;
  }

  changeTemplate(): void {
    this.isLoading = true;
    this.showEditBox = false;
    switch (this.campaign.campaignType) {
      case 1:
        this.loadAllEmailTemplates();
        break;
      case 2:
        this.loadAllSmsTemplates();
        break;
    }
  }

  clearTemplate(): void {
    this.isLoading = true;
    this.showEditBox = false;
    switch (this.campaign.campaignType) {
      case 1:
        this.clearEmailTemplate();
        break;
      case 2:
        this.clearSmsTemplate();
        break;
    }
  }

  clearEmailTemplate(): void {
    this.appEventsManager.loadingStart('Clearing campaign template...');
    this.templateService.deleteTokens('Email', this.messageId).subscribe(
      (count) => {
        this.saveCampaign();
        this.template = null;
        this.loadEmailTemplates();
        this.appEventsManager.loadingStop();
        this.alertService.success(`${count} template tokens cleared.`);
      }
    );
  }

  clearSmsTemplate(): void {
    this.appEventsManager.loadingStart('Clearing campaign template...');
    this.templateService.deleteTokens('Sms', this.messageId).subscribe(
      (count) => {
        this.clearToken();
        this.saveCampaign();
        this.template = null;
        this.loadSmsTemplates();
        this.appEventsManager.loadingStop();
        if (count > 0) {
          this.alertService.success(`${count} template tokens cleared.`);
        } else {
          this.alertService.success('Template tokens cleared.');
        }
      }
    );
  }

  editToken(event: any): void {
    event.preventDefault();
    this.clearToken();
    this.linkSelected = false;

    if (event.which === 1) {
      if (this.canEdit) {
        this.showEditBox = false;
        if (this.isImageTarget(event)) {
          this.selectImage(event);
        } else {
          const selection = window.getSelection();
          if (selection) {
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              if (range) {
                this.token = this.extractToken(event, range);
                if (this.token === '') { return; }
                this.linkSelected = this.isLinkSelected(event.target);
                this.showEditBox = true;
              }
            }
          }
        }
      }
    }
  }

  isLinkSelected(node: any): boolean {
    this.link = `${this.token}-link`;
    if (node.outerHTML.toLowerCase().indexOf(this.link) > 0) { return true; }
    if (node.parentNode.outerHTML.toLowerCase().indexOf(this.link) > 0) { return true; }
    this.link = '';
    return false;
  }

  extractToken(item: any, selection: Range): string {
    const text: string = item.target.innerText;
    const count = text.split('[').length - 1;
    if (count > 1) {
      const endIndex = text.indexOf(']', selection.startOffset);
      if (endIndex < 0) { return ''; }
      const startIndex = text.substring(0, selection.endOffset).lastIndexOf('[');
      if (startIndex < 0) { return ''; }
      const tag = text.substring(startIndex, endIndex + 1);
      if (tag.indexOf('[') !== 0) { return ''; }
      if (tag.indexOf('[', 1) > 0) { return ''; }
      if (tag.lastIndexOf(']') !== tag.length - 1) { return ''; }
      return tag.substring(1, tag.length - 1);
    } else {
      let idx = text.indexOf('[');
      if (idx < 0) { return ''; }
      let tag = text.substr(idx + 1);
      idx = tag.indexOf(']');
      if (idx < 0) { return ''; }
      tag = tag.substr(0, idx);
      return tag;
    }
  }

  dropToken(item: any): void {
    item.stopPropagation();
    item.preventDefault();
    if (this.canEdit) {
      if (this.isImageTarget(item)) {
        const data = item.dataTransfer;
        if (data.files) {
          this.updateImage(item, data.files);
        }
        item.target.style.border = this.saveStyle;
      }
    }
  }

  selectImage(item: any): void {
    const dialog = document.createElement('input');
    dialog.addEventListener('change', () => {
      this.updateImage(item, dialog.files);
    }, false);
    dialog.type = 'file';
    dialog.accept = 'image/*';
    dialog.multiple = false;
    dialog.click();
  }

  updateImage(item: any, files: any) {
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isImageFile(file)) {
        this.loadImage(item, file);
      }
    }
  }

  loadImage(item: any, file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      this.addImageToken(content as string);
      item.target.src = content;
    };
    reader.onerror = (error) => {
      this.alertService.error(`Error loading image: ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  addImageToken(content: string): void {
    this.tokenValue = content;
    this.saveTokens();
  }

  dragEnter(item: any): void {
    item.stopPropagation();
    item.preventDefault();
    if (this.isImageTarget(item)) {
      if (item.target) {
        this.saveStyle = item.target.style.border;
        item.target.style.border = '3px dotted red';
      }
    }
  }

  dragOver(item: any): void {
    item.stopPropagation();
    item.preventDefault();
  }

  dragLeave(item: any): void {
    item.stopPropagation();
    item.preventDefault();
    if (this.isImageTarget(item)) {
      if (item.target) {
        item.target.style.border = this.saveStyle;
      }
    }
  }

  saveTokens(): void {
    this.saveToken(this.token, this.tokenValue);
    this.saveToken(this.link, this.linkValue);
    this.tokens.sort(this.compareTokens);
    this.loadTokens();
    this.clearToken();
    this.showEditBox = false;
  }

  compareTokens(a: Token, b: Token): number {
    const nameA = a.tokenKey.toLowerCase();
    const nameB = b.tokenKey.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  saveToken(tokenKey: string, tokenValue: string): void {
    if (!tokenKey) { return; }
    tokenKey = tokenKey.trim();
    if (tokenKey === '') { return; }
    let token = this.tokens.find(t => t.tokenKey === tokenKey);
    if (token) {
      token.tokenValue = tokenValue;
      token.modifiedDate = new Date();
      token.modifiedBy = this.authService.getUserEmail();
    } else {
      token = new Token();
      token.id = 0;
      token.emailId = this.isEmailCampaign ? this.messageId : 0;
      token.smsId = this.isSmsCampaign ? this.messageId : 0;
      token.tokenKey = tokenKey;
      token.tokenValue = tokenValue;
      token.isActive = true;
      token.isDeleted = false;
      token.createdBy = this.authService.getUserEmail();
      token.createdDate = new Date();
      token.modifiedBy = token.createdBy;
      token.modifiedDate = token.createdDate;
      this.tokens.push(token);
    }
  }

  clearToken(): void {
    this.token = '';
    this.tokenValue = '';
    this.link = '';
    this.linkValue = '';
  }

  isImageFile(file: File) {
    return file.type.indexOf('image') >= 0;
  }

  isImageTarget(item: any) {
    const target = item.target;
    if (target) {
      const name: string = target.nodeName;
      if (name.toLowerCase() === 'img') {
        const uri = target.baseURI;
        if (uri) {
          const src: string = target.src.replace(uri, '').trim();
          if (src.length > 0) {
            this.token = src.substr(1, src.length - 2).trim();
            return src.startsWith('[') && src.endsWith(']');
          }
        }
      }
    }
    return false;
  }

  saveTemplate(): void {
    this.appEventsManager.loadingStart('Saving campaign template...');
    let api = 'Email';
    if (this.campaign.campaignType === 2) {
      api = 'Sms';
    }
    this.templateService.saveTokens(api, this.tokens).subscribe(
      () => {
        this.saveCampaign();
        this.appEventsManager.loadingStop();
        this.alertService.success('Template successfully saved.');
      }
    );
  }

  saveCampaign(): void {
    if (this.campaign.id > 0) {
      if (this.campaign.campaignStatus === CampaignStatus.New) { return; }
      if (this.campaign.campaignStatus === CampaignStatus.Updated) { return; }
      this.campaign.campaignStatus = CampaignStatus.Updated;
      this.appEventsManager.loadingStart('Updating campaign status...');
      this.campaignService.editCampaign(this.campaign).subscribe(() => {
        this.appEventsManager.loadingStop();
      });
    }
  }

  resizeContainers(): void {
    const templateContainer = document.getElementById('templateContainer');
    if (!templateContainer) { return; }
    const tokenContainer = document.getElementById('tokenContainer');
    if (!tokenContainer) { return; }
    const width = templateContainer.clientWidth / 3;
    tokenContainer.style.width = `${width}px`;
  }

  clearTemplateToken(token: Token): void {
    const idx = this.tokens.findIndex(t => t.tokenKey === token.tokenKey);
    if (idx < 0) { return; }
    const removed = this.tokens.splice(idx, 1);
    this.template.template = this.blankTemplate;
    this.loadTokens();
  }
}
