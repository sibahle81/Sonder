import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { Editor } from 'ngx-editor';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogueComponent } from '../common-dialogue/common-dialogue.component';
import Adapter from 'projects/marketingcare/src/app/marketing-manager/ckeditorAdaptor';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';
import { TemplateChannelEnum } from 'projects/shared-models-lib/src/lib/enums/template-channel-enum';

@Component({
  selector: 'app-create-message-template',
  templateUrl: './create-message-template.component.html',
  styleUrls: ['./create-message-template.component.css']
})
export class CreateMessageTemplateComponent implements OnInit, OnDestroy {

  selectedTab: string = 'SMS';
  typeTabs: string[] = ['SMS', 'Email', 'WhatsApp'];
  templateTypeList: string[] = ['Document', 'Image', 'Video', 'Location', 'Text']
  timeSlots: string[] = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 AM'];
  buttonList: string[] = ['Call to Action', 'Quick Reply']
  createTemplateForm: FormGroup;
  smsForm: FormGroup;
  emailForm: FormGroup;
  whatsappForm: FormGroup;
  previewSMSText: string | undefined = null;
  previewWhatsappText: string | undefined = null;
  templateNameInvalid: boolean = false;
  scheduleDayInvalid: boolean = false;
  scheduleTimeInvalid: boolean = false;
  isInvalid: boolean = false;

  public Editor: any = ClassicEditor;

  public isDisabled = false;
  ckconfig: any;
  public componentEvents: string[] = [];
  
  editorText: string = `<p>Hello {Name}</p> `
  scheduleDayMinValue: number = 1;

  editorConfig = {
    editable: true,
    spellcheck: false,
    placeholder: 'Hello {name}',
    translate: 'no'
  };

  htmlContent = '';
  TextEditor: any = null;

  channelSms: any = null;
  channelEmail: any = null;
  channelWhatsapp: any = null;

  editor: Editor;
  html: '';
  isSpinner: boolean = false;
  mainAction: string = '';
  typeOfAction: string = '';
  templateDetails: any | undefined;

  enableCallPhoneNumber: boolean = false;
  isVisitSiteEanble: boolean = false;

  isCallNumberChecked = false;
  isVisitChecked: boolean = false;
  templateIdList: any = [];
  isSaveEnable: boolean = false;
  isPreviewTemplate: boolean = false;
  currentAction: string = ''

  hoursList: number[] = Array(23).fill(1).map((n, i) => n + i);
  minuteList: number[] = Array(59).fill(1).map((n, i) => n + i);
  maxChars: number = 8000;
  @ViewChild('myckeditor') ckeditor: any;


  constructor(private router: Router, private readonly fb: FormBuilder,
    private dataService: DataService,
    private marketingApiService: MarketingcareApiService,
    private readonly toastr: ToastrManager,
    private readonly dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getFormDetails();
    this.editor = new Editor();
    this.ckconfig = {
      extraPlugins: [ this.customAdapterPlugin ]
    };
  }

  getFormDetails(): void {

    this.createTemplateForm = this.fb.group<any>({
      campaignName: new FormControl(this.dataService.getCampaignNameAndTypeId().name, [Validators.required]),
      templateName: new FormControl('', [Validators.required]),
      scheduleDay: new FormControl('', [Validators.required]),
      scheduleTime: new FormControl('', [Validators.required]),
      message: new FormControl(null),
      templateId: new FormControl(''),
      type: new FormControl(''),
      whtsAppMessege: new FormControl(null),
      button: new FormControl(''),
      buttonTextCall: new FormControl(''),
      phoneNumber: new FormControl(''),
      buttonTextVisitSite: new FormControl(''),
      websiteUrl: new FormControl(''),
      typeUrl: new FormControl('')
    });

    this.getTemplateDetails();

  }

  getTemplateDetails(){
    

    this.templateDetails = this.dataService.getTemplateDetails();

    if(this.templateDetails){

    this.currentAction = this.templateDetails.action;

     if(this.currentAction == 'edit'){
      this.channelSms = this.templateDetails?.channelData.find((item: any) => item.channelId == TemplateChannelEnum.Sms)
      this.channelEmail = this.templateDetails?.channelData.find((item: any) => item.channelId == TemplateChannelEnum.Email)
      this.channelWhatsapp = this.templateDetails?.channelData.find((item: any) => item.channelId == TemplateChannelEnum.Whatsapp)
      this.isPreviewTemplate = false;
      this.patchDetails(this.templateDetails)
     }else if(this.currentAction == 'preview'){
      this.channelSms = this.templateDetails?.channelData.find((item: any) => item.channelId == TemplateChannelEnum.Sms)
      this.channelEmail = this.templateDetails?.channelData.find((item: any) => item.channelId == TemplateChannelEnum.Email)
      this.channelWhatsapp = this.templateDetails?.channelData.find((item: any) => item.channelId == TemplateChannelEnum.Whatsapp)
      this.isPreviewTemplate = true;
      this.patchDetails(this.templateDetails)
     }else{
      this.isPreviewTemplate = false;
     }
    }
  }

  patchDetails(details: any): void{
    this.createTemplateForm.get('campaignName').setValue(details.campaignName);
    this.createTemplateForm.get('templateName').setValue(details.name);
    this.createTemplateForm.get('scheduleDay').setValue(details.scheduleDay);
    this.createTemplateForm.get('scheduleTime').setValue(details.scheduleTime);
    this.getChannelMessage(details.channelData)
  }

  getChannelMessage(channelInfo: any): void{
     let smsInfo = {}, emailInfo = {}, whatsAppInfo = {};

     smsInfo = channelInfo.find((item: any) => item.channelId == 1)
     emailInfo = channelInfo.find((item: any) => item.channelId == 2)
     whatsAppInfo = channelInfo.find((item: any) => item.channelId == 3)

    if(smsInfo != undefined){
      this.createTemplateForm.get('message').setValue(smsInfo['message'] ? smsInfo['message'] : null);
      this.previewSMSText = smsInfo['message'];
    }
    if(emailInfo != undefined){
      this.TextEditor = emailInfo['message'] ? emailInfo['message'] : null
    }
    if(whatsAppInfo != undefined){
      this.createTemplateForm.get('whtsAppMessege').setValue(whatsAppInfo['message'] ? whatsAppInfo['message'] : null);
      this.previewWhatsappText = whatsAppInfo['message'];
    }
  }

  goBack(isAdded: string): void {
    localStorage.setItem('templateIdDetails', JSON.stringify(this.templateIdList));
    this.router.navigate(['/marketingcare/create-campaign',
      {
        name: this.createTemplateForm.value.campaignName,
        id: this.dataService.getCampaignNameAndTypeId().campaignMarketingTypeId,
        mktCampTypeName:  this.dataService.getCampaignNameAndTypeId().mktCampType,
        isAdded: isAdded
      }
    ])
  }

  onSelectTab(item: string): void {
    this.selectedTab = item;
  }

  readSMS(e: Event): void {
    this.createTemplateForm.get('scheduleTime').setValue(this.createTemplateForm.get('scheduleTime').value || '');
    const scheduleTime = this.createTemplateForm.get('scheduleTime').value;
    this.previewSMSText = e.toString();
    const scheduleTimeCondition = true;
    const scheduleTimeClass = scheduleTimeCondition ? 'align-right-class' : '';
    
    if (scheduleTime) {
    this.previewSMSText += `<br><br><span class="${scheduleTimeClass}">${scheduleTime}</span>`;
    }
  
    const formDetails = this.createTemplateForm.value;
    let requiredFieldValue: boolean = (formDetails.templateName == "" && formDetails.scheduleDay == "" && formDetails.scheduleTime == "") ? false : true;
    if (this.previewSMSText.length > 0 && requiredFieldValue) {
      this.isSaveEnable = true;
    } else {
      this.isSaveEnable = false;
    }
  }
  
  readWhatsapp(e: Event): void {
    this.createTemplateForm.get('scheduleTime').setValue(this.createTemplateForm.get('scheduleTime').value || '');
    const scheduleTime = this.createTemplateForm.get('scheduleTime').value;
    this.previewWhatsappText = e.toString();
    const scheduleTimeCondition = true; 
    const scheduleTimeClass = scheduleTimeCondition ? 'align-right-class' : '';
    
    if (scheduleTime) {
    this.previewWhatsappText += `<br><br><span class="${scheduleTimeClass}">${scheduleTime}</span>`;
    }
  

    const formDetails = this.createTemplateForm.value;
    let requiredFieldValue: boolean = (formDetails.templateName == "" && formDetails.scheduleDay == "" && formDetails.scheduleTime == "") ? false : true;
    if (this.previewWhatsappText.length > 0 && requiredFieldValue) {
      this.isSaveEnable = true;
    } else {
      this.isSaveEnable = false;
    }

  }

  onSave(): void {
    let payload = {
      Name: this.createTemplateForm.value.campaignName,
      ScheduleDay: this.createTemplateForm.value.scheduleDay,
      ScheduleTime: this.createTemplateForm.value.scheduleTime,
      CampaignId: "7",
      Status: "Active"
    }


    this.isSpinner = true;
    this.marketingApiService.AddMarketingCareCampaignTemplate(payload).subscribe((res: any) => {
      if (res && res.data == '1') {

        this.isSpinner = false;
        this.toastr.successToastr('Campaign Added successfully.', '', true);
        this.router.navigate(['marketingcare/campaign'])
      } else {
        this.isSpinner = false;
        this.toastr.errorToastr('Error while adding Campaign', '', true);

      }
    })

  }

  updateTemplate(): void {
    let text: string = this.TextEditor != null ? this.TextEditor.toString() : '';
    let SmsMessage = this.createTemplateForm.value.message;
    let waMessage = this.createTemplateForm.value.whtsAppMessege
    
    if(this.createTemplateForm.status == "VALID"){

      let templateId = null;
      let tempMessages: any = [];
      
      if((this.TextEditor == null || this.TextEditor == undefined || text.length == 0) && this.createTemplateForm.value.message.length == 0){
        this.toastr.errorToastr('Template cannot be created without channels','',false)
      }else {
        const messagePayload = {
        smsTemplate: {
          "ChannelId": TemplateChannelEnum.Sms.toString(),
          "Message": this.createTemplateForm.value.message ? this.createTemplateForm.value.message : '',
          "MessageType": "1",
          "EmailSubject": "",
          "WhatsappTemplateId": "1",
          "ButtonTypeId": "1",
          "ActionTypeId": "1",
          "CallButtonText": "",
          "CallPhoneNumber": "",
          "VisitSiteButtonText": "",
          "VisitSiteUrlType": "",
          "VisitSiteWebsiteUrl": "",
          "Id":  this.channelSms?.id,
          "CampaignTemplateId": this.templateDetails.id
        },
  
        emailTemplate: {
          "ChannelId": TemplateChannelEnum.Email.toString(),
          "Message": this.TextEditor ? this.TextEditor : '',
          "MessageType": "1",
          "EmailSubject": "",
          "WhatsappTemplateId": "1",
          "ButtonTypeId": "1",
          "ActionTypeId": "1",
          "CallButtonText": "",
          "CallPhoneNumber": "",
          "VisitSiteButtonText": "",
          "VisitSiteUrlType": "",
          "VisitSiteWebsiteUrl": "",
          "Id": this.channelEmail?.id,
          "CampaignTemplateId": this.templateDetails.id
        },
  
        whatsAppTemplate: (waMessage && waMessage.length > 0) ? {
          "ChannelId": TemplateChannelEnum.Whatsapp.toString(),
          "Message": this.createTemplateForm.value.whtsAppMessege ? this.createTemplateForm.value.whtsAppMessege : '',
          "MessageType": "1",
          "EmailSubject": "",
          "WhatsappTemplateId": "1",
          "ButtonTypeId": "1",
          "ActionTypeId": "1",
          "CallButtonText": this.createTemplateForm.value.buttonTextCall ? this.createTemplateForm.value.buttonTextCall : '',
          "CallPhoneNumber": this.createTemplateForm.value.phoneNumber ? this.createTemplateForm.value.phoneNumber : '',
          "VisitSiteButtonText": this.createTemplateForm.value.buttonTextVisitSite ? this.createTemplateForm.value.buttonTextVisitSite : '',
          "VisitSiteUrlType": this.createTemplateForm.value.typeUrl ? this.createTemplateForm.value.typeUrl : '',
          "VisitSiteWebsiteUrl": this.createTemplateForm.value.websiteUrl ? this.createTemplateForm.value.websiteUrl : '',
          "Id": this.channelWhatsapp?.id,
          "CampaignTemplateId": this.templateDetails.id
        } : undefined
  
        }
        tempMessages = [];

        if (messagePayload.smsTemplate != undefined) {
        tempMessages.push(messagePayload.smsTemplate)
        }
  
        if (messagePayload.emailTemplate != undefined) {
        tempMessages.push(messagePayload.emailTemplate)
        }
  
        if (messagePayload.whatsAppTemplate != undefined) {
        tempMessages.push(messagePayload.whatsAppTemplate)
        }
  
        const payload = {
        "Id": this.templateDetails.id,
        "CampaignId": this.templateDetails.camapinId, 
        "Name": this.createTemplateForm.value.templateName,
        "ScheduleDay": this.createTemplateForm.value.scheduleDay,
        "ScheduleTime": this.createTemplateForm.value.scheduleTime,
        "CampaignTemplateChannelList": [...tempMessages]
        }
      tempMessages = [];
      this.isSpinner = true;

      this.marketingApiService.updateMarketingcareTemplate(payload).subscribe((res: any) => {
        if (res && res.data == DataResponseEnum.Success) {
          this.isSpinner = false;
          this.toastr.successToastr('Updated Template Successfully','',false)
          this.goBack('updated');
        }else{
          this.isSpinner = false;
          this.toastr.errorToastr(res.message,'',false)
        }
      })
  
        }
      }

  }

  onTypeEmail(e: Event): void {

  }

  createCampaignTemplate(): void {

    const formDetails = this.createTemplateForm.value;
    let requiredFieldValue: boolean = (formDetails.templateName == "" && formDetails.scheduleDay == "" && formDetails.scheduleTime == "") ? false : true;

    this.templateNameInvalid = this.createTemplateForm.get('templateName')?.invalid
    this.scheduleDayInvalid = this.createTemplateForm.get('scheduleDay')?.invalid;
    this.scheduleTimeInvalid = this.createTemplateForm.get('scheduleTime')?.invalid;

    if(this.createTemplateForm.status == "VALID"){

    let templateId = null;
    let tempMessages: any = [];
    const messagePayload = {

      smsTemplate: {
        "ChannelId": "1",
        "Message": this.createTemplateForm.value.message ? this.createTemplateForm.value.message : '',
        "MessageType": "1",
        "EmailSubject": "",
        "WhatsappTemplateId": "1",
        "ButtonTypeId": "1",
        "ActionTypeId": "1",
        "CallButtonText": "",
        "CallPhoneNumber": "",
        "VisitSiteButtonText": "",
        "VisitSiteUrlType": "",
        "VisitSiteWebsiteUrl": "",
      },

      emailTemplate: {
        "ChannelId": "2",
        "Message": this.TextEditor ? this.TextEditor : '',
        "MessageType": "1",
        "EmailSubject": "",
        "WhatsappTemplateId": "1",
        "ButtonTypeId": "1",
        "ActionTypeId": "1",
        "CallButtonText": "",
        "CallPhoneNumber": "",
        "VisitSiteButtonText": "",
        "VisitSiteUrlType": "",
        "VisitSiteWebsiteUrl": "",
      },

      whatsAppTemplate: {
        "ChannelId": "3",
        "Message": this.createTemplateForm.value.whtsAppMessege ? this.createTemplateForm.value.whtsAppMessege : '',
        "MessageType": "1",
        "EmailSubject": "",
        "WhatsappTemplateId": "1",
        "ButtonTypeId": "1",
        "ActionTypeId": "1",
        "CallButtonText": this.createTemplateForm.value.buttonTextCall ? this.createTemplateForm.value.buttonTextCall : '',
        "CallPhoneNumber": this.createTemplateForm.value.phoneNumber ? this.createTemplateForm.value.phoneNumber : '',
        "VisitSiteButtonText": this.createTemplateForm.value.buttonTextVisitSite ? this.createTemplateForm.value.buttonTextVisitSite : '',
        "VisitSiteUrlType": this.createTemplateForm.value.typeUrl ? this.createTemplateForm.value.typeUrl : '',
        "VisitSiteWebsiteUrl": this.createTemplateForm.value.websiteUrl ? this.createTemplateForm.value.websiteUrl : '',
      }

    }
    tempMessages = [];
    if (this.createTemplateForm.value.message != null && messagePayload.smsTemplate.Message != "") {
      tempMessages.push(messagePayload.smsTemplate)
    }

    if (this.TextEditor != null && messagePayload.emailTemplate.Message != "") {
      tempMessages.push(messagePayload.emailTemplate)
    }

    if (this.createTemplateForm.value.whtsAppMessege != null && messagePayload.whatsAppTemplate.Message != "") {
      tempMessages.push(messagePayload.whatsAppTemplate)
    }

    const payload = {
      "Name": this.createTemplateForm.value.templateName,
      "ScheduleDay": this.createTemplateForm.value.scheduleDay,
      "ScheduleTime": this.createTemplateForm.value.scheduleTime,
      "CampaignTemplateChannelList": [...tempMessages]
    }

    tempMessages = [];
    this.isSpinner = true;
    this.marketingApiService.AddMarketingCareCampaignTemplate(payload).subscribe((res: any) => {

      if (res && res.data == '1') {

        this.isSpinner = false;
        this.toastr.successToastr('Template Created successfully.', '', true);
        templateId = res.recordId;

        this.templateIdList.push({ id: templateId, name: this.createTemplateForm.value.templateName })

        this.dataService.setCampaignTemplateDetails({ id: templateId, name: this.createTemplateForm.value.templateName })

        this.dialog.open(CommonDialogueComponent, {
          disableClose: true,
          width: '45vw',
          data: {
            action: 'add_template_message'
          }
        }).afterClosed().subscribe((res: any) => {
          if (res && res.key == 'cancel') {
            this.goBack('added');
          } else {
            this.createTemplateForm.get('templateName').reset();
            this.createTemplateForm.get('scheduleDay').reset();
            this.createTemplateForm.get('scheduleTime').reset();
            this.createTemplateForm.get('message').reset();
            this.TextEditor = null;
            this.createTemplateForm.get('whtsAppMessege').reset();
            this.previewSMSText = null;
            this.previewWhatsappText = null;
          }
        })

      } else if (res && res.data == '0') {
        this.isSpinner = false;
        this.toastr.errorToastr(res.message, '', true)

      } else {
        this.isSpinner = false;

      }
    })
  }
  }

  selectBuutonOption(buttonText: string): void {
    this.mainAction = buttonText;
  }

  updateCheck(value: string, isSelected: boolean): void {

    if (value == 'phoneNumber') {
      this.enableCallPhoneNumber = isSelected;
    } else if (value == 'visit') {
      this.isVisitSiteEanble = isSelected;
    } else {
      this.enableCallPhoneNumber = false;
      this.isVisitSiteEanble = false;
    }
  }


  onReadEmail(e: any){
    let text: string = e.toString();
    const formDetails = this.createTemplateForm.value;
    let requiredFieldValue: boolean = (formDetails.templateName == "" && formDetails.scheduleDay == "" && formDetails.scheduleTime == "") ? false : true;
    if (text.length > 0 && requiredFieldValue) {
      this.isSaveEnable = true;
    } else {
      this.isSaveEnable = false;
    }

  }

  onReady(editor){
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
    return new Adapter(loader, editor.config);;
    };
  }

  customAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new Adapter(loader, editor.config);
    };
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
