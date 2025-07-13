import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { DataService } from '../../services/data.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogueComponent } from '../common-dialogue/common-dialogue.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MarketingApprovalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/campaign-action.enum';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';

interface campaignForm {
  campaignName: FormControl<string | null>
}

interface approverNameList{
  userName: string;
}

interface selectedApprover{
  campaignId: number,
  campaignTypeApproverId: number,
  approverUserId: number,
  marketingApprovalStatus: number,
  rejectionNotes: string,
  id: number,
  isActive: boolean,
  isDeleted: boolean,
  createdBy: string,
  createdDate: string,
  modifiedBy: string,
  modifiedDate: string
}

interface filteredOptions {
    id: number,
    campaignName: string
}

@Component({
  selector: 'app-create-campaign',
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css']
})
export class CreateCampaignComponent implements OnInit, OnDestroy {

  showApprover: boolean = false;
  campaignTypeId: number = null;
  approverNameList = [];
  campaignTypeList = [];
  approverList = [];
  createCampaignForm!: FormGroup;
  isLoading: boolean = false;
  isSpinner: boolean = false;
  loggedUser: any = {};
  showActionBtns: boolean = false;
  campaignID: string;
  campaignName: string;
  MktCampaignTypeName: string;
  selectedApproversList = [];
  createdTemplateIds = [];
  campDetails: any = {};
  isApproverAvalable: boolean = false;
  preSelectedApprovers = [];
  currentApproverNameList = [];
  canEdit: boolean;
  approversList = [];
  aaproverValues = [];
  approverListData = [];
  campaignTypeName: string;
  userSubIdList: number[] = [];
  enableApproverOption: boolean = false;
  removedTemplateIds = [];

  myControl = new UntypedFormControl();
  @ViewChild('selectUser', { static: true }) selectUser: ElementRef<HTMLInputElement>;

  filteredOptions: filteredOptions[] = [];
  selectedApproverList: selectedApprover[] = [];
  seletedApproverNameList: approverNameList[] = [];
  formSubmitted: boolean = false;
  availableApproverList: number[] = [];
  currentApproverRow: number;
  isEditMode: boolean = false; 
  typeChangedOnEdit: string = 'show_value';
  isNameLengthExceed: boolean = false;
  approverNameSelectedList: boolean[] = [];
  approverCount: number = 0;
  isAllApproverSelected: boolean;
  selectApproverMessage: boolean = false;
  templateAddedStatus: string = null;
  hideCreateTemplate: boolean = false; 
  requiredTemplateMsg: boolean = false;

  constructor(private router: Router,
    private fb: FormBuilder,
    private mktApiService: MarketingcareApiService,
    public dataService: DataService,
    private toastr: ToastrManager,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.campaignID = this.route.snapshot.paramMap.get('id');
    this.campaignName = this.route.snapshot.paramMap.get('name');
    this.MktCampaignTypeName = this.route.snapshot.paramMap.get('mktCampTypeName');
    this.templateAddedStatus = this.route.snapshot.paramMap.get('isAdded');
  }

  ngOnInit(): void {
    this.getCreateCampaignForm();
    this.getMarketingCampaignType('0');
    const details = this.dataService.getCampaignDetails();
    this.campDetails = details;
    this.loggedUser = JSON.parse(EncryptionUtility.decryptData(sessionStorage.getItem('auth-profile')));


    this.typeChangedOnEdit = details.action == 'edit' || details.action == 'view' ? 'show_value' : 'hide_value';

    if(details.action == 'create'){
      this.isAllApproverSelected = false;
      this.selectApproverMessage = false;
      const datValues = this.dataService.getApproverNameList();
      this.hideCreateTemplate = (this.templateAddedStatus != null && this.templateAddedStatus == 'added') ? true : false;
      this.getTemplateDetails();
    }else{
      this.hideCreateTemplate = (this.templateAddedStatus != null && this.templateAddedStatus == 'added') ? true : false;
      this.isAllApproverSelected = true;
      this.selectApproverMessage = false;
    }
    


    if ((details.action && (details.action == 'edit' || details.action == 'view'))) {
      this.isEditMode = true;
      this.getCampaignTemplate(details.item.id);
      this.patchCampainDetails(details.item.name, details.item.campaignMarketingTypeId, true);
      if(this.campaignID != null && this.campaignName != null){
        this.getApproverNameList();
      }
    } else if (this.campaignID != null && this.campaignName != null) {
      this.isEditMode = false;
      this.patchCampainDetails(this.campaignName,this.campaignID, false);
      this.getApproverNameList();
      this.isAllApproverSelected = true;
      this.selectApproverMessage = false;
    } else {
      this.isEditMode = false;
      this.createCampaignForm.get('campaignName').setValue(null);
      this.myControl.patchValue(null);
    }
  }

  getApproverNameList(): void{
     this.approverListData = this.dataService.getApproverNameList();
      if(this.approverListData && this.approverListData?.length > 0){
        this.getSelectedApprover();
      }
  }

  getCampaignIdList(): void {
    this.createdTemplateIds = JSON.parse(localStorage.getItem('templateIdDetails'));
  }

  getCreateCampaignForm(): void {
    this.createCampaignForm = this.fb.group<campaignForm>({
      campaignName: new FormControl('', [Validators.required]),
    });
    this.setPermission();
  }

  getMarketingCampaignType(id: string): void {
    this.campaignTypeList = [];
    this.filteredOptions = [];

    this.mktApiService.getCampaignTypeDetails(id).subscribe((res: any) => {
      if (res && res['data']) {
        this.campaignTypeList = res['data'];
        this.filteredOptions = this.campaignTypeList.slice();
      } 
    })
  }

  patchCampainDetails(name: string,id: string, isEdit: boolean): void {
    this.createCampaignForm.get('campaignName').setValue(name);
    if(isEdit){
      this.myControl.patchValue(this.campDetails.item.campaignTypeName)
    }else{
      this.myControl.patchValue(this.MktCampaignTypeName)
    }
    this.selectCampaignType(Number(id),null, isEdit, 0)
  }

  selectCampaignType(id: number,typeName: string, isEdit: boolean, checkVal: number): void {
    this.approverNameSelectedList = [];
    this.campaignTypeId = id;
    this.campaignTypeName = typeName;
    this.getCampaignApprovalList(id.toString(), isEdit, checkVal, isEdit ? this.campDetails.item?.id : 0);
  }
getCampaignApprovalList(id: string, isEdit: boolean, checkVal: number, campId: number): void {
  this.isSpinner = true;
  this.approverList = [];

  let campignId = campId;

  if (isEdit) {
    this.typeChangedOnEdit = 'show_value';
  }else{
    this.typeChangedOnEdit = 'hide_value';
  }


  this.mktApiService.getMarketingCareApprovalList(id, campignId).subscribe((res: any) => {
      if (res && res.data) {
          if (checkVal === 0) {
              this.isSpinner = this.isEditMode ? true : false;
          } else {
              this.isSpinner = true;
          }
          this.approverList = res.data;

          this.isApproverAvalable = this.approverList.length === 0;
          if(this.isApproverAvalable){
            this.isSpinner = false
          }else{
            this.getApprovalNameBasedOnRoleId(this.isEditMode);
          }

      } else {
          this.isSpinner = false;
      }
  });
}
  getSelectedApprover(): void {
    let data = this.approverListData;
    if (data != null) {
      this.preSelectedApprovers = data;

      let tempList = [];
      tempList = data?.map((item: any, i: number) => {
        return {
          ApproverUserId: item.ApproverUserId,
          CampaignTypeApproverId: item.CampaignTypeApproverId,
          MarketingApprovalStatus: '1'
        }
      })
        this.selectedApproversList = tempList;


    } 
  }

  createTemplate(): void {
   if(this.isAllApproverSelected){
    this.onCreateTemplate();
    this.selectApproverMessage = false;
   }else{
    this.selectApproverMessage = true;
   }
  }

  onCreateTemplate(): void{
    this.dataService.setCampaignNameAndTypeId(this.createCampaignForm.value.campaignName, this.campaignTypeId, this.myControl.value,this.campDetails.item.id)
    const templateData = { 
      action: 'create'
    }
    this.dataService.setTemplateData(templateData);
    if(this.createdTemplateIds?.length == 0){
      this.dataService.setApproverNameList(this.currentApproverNameList)
    }
    localStorage.setItem('removedTemplateIds',JSON.stringify(this.removedTemplateIds))
    this.router.navigate(['marketingcare/create-message-template'])
  }

  goBack(): void {
    localStorage.removeItem('removedTemplateIds');
    this.router.navigate(['marketingcare/campaign'])
  }

  removeTemplate(index: number): void {
    if (index > -1) {
      this.removedTemplateIds.push(this.createdTemplateIds[index].id)
      this.createdTemplateIds.splice(index, 1);
    }
  }

  onSave(action: string): void{
    
    if(this.campDetails.action == 'edit'){
      this.selectApproverMessage = false;
      this.onSaveData(action);
    }else{
      if(this.createdTemplateIds?.length == 0){
        this.requiredTemplateMsg = true;
      }else{
        this.onProceedSave(action);
      }
    }
    
  }

  onProceedSave(currentAction: string): void{
    this.requiredTemplateMsg = false;
    let approvalDetails = {};
    if(localStorage.getItem('approvalCount')){
      approvalDetails =  JSON.parse(localStorage.getItem('approvalCount'))
    }
    if(this.approverCount === this.approverList.length || approvalDetails === this.approverList.length){
      this.selectApproverMessage = false;
      this.onSaveData(currentAction);
    }else{
      this.selectApproverMessage = true;
    }
  }

  onSaveData(action: string): void{
        let TempIdList: any;
        if(this.createdTemplateIds && this.createdTemplateIds?.length > 0){
          TempIdList = this.createdTemplateIds?.map((item: any) => item.id)
        }
 
        let payload = {
          CampaignMarketingTypeId: this.campaignTypeId,
          Name: this.createCampaignForm.value.campaignName,
          marketingTemplateIds: (TempIdList && TempIdList?.length) > 0 ? TempIdList.join(',') : undefined,
          marketingApprovalsinfo: this.selectedApproversList
        }
 
        if(action == 'edit'){
          this.onUpdateCampaign(payload)
        }else{
          if(this.createCampaignForm.value.campaignName?.length <= 250){
            this.isNameLengthExceed = false;
            this.isSpinner = true;
            if(localStorage.getItem('approvalCount')){
              localStorage.removeItem('approvalCount')
            }
            this.mktApiService.addMarketingCareCampaign(payload).subscribe((res: any) => {
          try{
            if(res && res.data == '1'){
              this.dataService.setData(res.result);
              this.toastr.successToastr('Campaign Added successfully', '', true);
              this.isSpinner = false;
              localStorage.removeItem('templateIdDetails');
              if(localStorage.getItem('removedTemplateIds')){
                localStorage.removeItem('removedTemplateIds')
              }
              this.router.navigate(['marketingcare/campaign'])
            }else{
              this.isSpinner = false;
              this.toastr.errorToastr(res.message,'',true);
            }
          }catch(err){
            this.isSpinner = false;
            this.toastr.errorToastr('Failed to Add campaign','',true);
            }
            })
          }else{
            this.isNameLengthExceed = true;
          }
        }
  }

  getApprovalNameBasedOnRoleId(isEdit: boolean): void {
    this.approverList.forEach((item: any, i: number) => {
      this.getMarketingCareRoleUsers(item.roleId, '0', i, isEdit)
    })

  }

  getMarketingCareRoleUsers(id: number, searchKey: string, index: number, isEdit: boolean) {
    let temArr: any = [];
    this.approverNameList = []

    this.mktApiService.getMarketingCareTypeRoleUsers(id, searchKey).subscribe((res: any) => {
      if (res && res.data) {
        this.approverNameList[index] = res.data
        this.approverNameSelectedList = this.approverNameList.map((n: any,i: number) => {
          let selectedData: any[];
         if(n.length > 0){
          selectedData = Array(this.approverList?.length).fill(null)
          }
          return selectedData[i]
        })
        this.isSpinner = isEdit ? true : false;
        if (isEdit) {
          this.getSelectedApproverInfo(this.campDetails.item.id)
        }

      } else {
        this.isSpinner = false;
      }
    })
  }

  setCampaignApprover(approverList: any, dataVal: any): void{


    approverList.map((val: any,index: number) => {
      let tempObj = {
        ApproverUserId: val?.approverUserId,
        CampaignTypeApproverId: dataVal[index]?.id,
        MarketingApprovalStatus: '1'
      }
      this.selectedApproversList[index] = tempObj;      
    })

    

  }

  updateCampaignApprover(item: any, approverItem: any,index: number): void {


    let tempObj = {
      ApproverUserId: item?.id,
      CampaignTypeApproverId: approverItem?.id,
      MarketingApprovalStatus: MarketingApprovalStatusEnum.Pending
    }
    let tempObj2 = { ...tempObj, ...item }
    this.selectedApproversList[index] = tempObj;

    this.currentApproverNameList[index] = tempObj2;

    const payload = {
      Id: approverItem?.id,
      CampaignId: this.campDetails?.item?.id ? this.campDetails?.item?.id : "0",
      ApproverUserId: item?.id,
      MarketingApprovalStatus: MarketingApprovalStatusEnum.Pending
    }

    this.isSpinner = true;
    this.mktApiService.updateMarketingCareAprovers(payload).subscribe((res: any) => {
      if(res && res?.data == '0'){
        this.isSpinner = false;
        this.showActionBtns = true;
        this.seletedApproverNameList[index] =  { userName: item?.userName };
        if(this.campDetails.action == 'create'){
          this.approverNameSelectedList[this.approverCount] = true;
          this.approverCount = this.approverCount + 1;
          localStorage.setItem('approvalCount',JSON.stringify(this.approverCount))
          this.isAllApproverSelected = this.approverNameSelectedList.every(v => v === true);
          this.selectApproverMessage = !this.isAllApproverSelected
        }
        this.toastr.successToastr('Approver name has been assign successfully', '', true);
      }else{
        this.isSpinner = false;
        this.showActionBtns = false;
        this.toastr.errorToastr(res.message, '', true);
      }
    })

  }

  getCampaignTemplate(id: number): void {
    this.mktApiService.getCampaignTemplate(id).subscribe((res: any) => {
      if (res && res.data) {
        this.getTemplatesForCampaign(res.data);
      } else {
        this.createdTemplateIds = [];

      }
    })
  }

  getTemplatesForCampaign(data: any[]): void {
    let TemplateDetails = JSON.parse(localStorage.getItem('templateIdDetails'))
    this.createdTemplateIds = [];
    if(TemplateDetails == null){
      this.createdTemplateIds = data;
      }else{

        if(localStorage.getItem('removedTemplateIds') != null){
          const removedTemplates = JSON.parse(localStorage.getItem('removedTemplateIds'));
          let detailsTemplate = [];
          removedTemplates.forEach(ele => {
            detailsTemplate = data.filter(item => item.id != ele)
          });
          this.createdTemplateIds = [...detailsTemplate,...TemplateDetails];
        }else{
          this.createdTemplateIds = [...data,...TemplateDetails];
        }
    }


  }

  getSelectedApproverInfo(id: number): void {

    this.mktApiService.getSelectedApprovers(id).subscribe((res: any) => {
      if (res && res.data) {
        this.selectedApproverList = res.data;
        this.setCampaignApprover(this.selectedApproverList, this.approverList)
        this.getApproversToPatch(res.data);
      }
    })
  }

  getApproversToPatch(data: any): void {

    let tempList: any = [];
    this.aaproverValues = [];

    this.approverList?.map((item: any, i: number) => {
      data?.map((val: any) => {
        this.approverNameList[i]?.map((dataObj: any) => {
          if (dataObj?.id == val?.approverUserId) {
              tempList.push({ userName: dataObj?.userName })
              this.availableApproverList.push(i+1)
              this.userSubIdList.push(dataObj?.id)
          } else {
            tempList.push({ userName: 'Select' })
          }

        })
      })

      if(this.userSubIdList.length > 0 && this.loggedUser){
    
        let uniqueIds = this.userSubIdList.filter((value, index, array) => {
          return array.indexOf(value) === index;
        });

        if(uniqueIds.includes(Number(this.loggedUser.sub))){
          this.enableApproverOption = true;
        }else{
          this.enableApproverOption = false;
        }
      }

      this.isSpinner = false;

    })

    this.aaproverValues = tempList.filter((item: any) => item?.userName != 'Select')

  }

  addMarketingCareApprover(): void {
    const payload = {
      "CampaignId": "2",
      "ApproverUserId": "1620",
      "ApprovalStatus": "Approved",
      "RejectionNotes": "",
      "Status": "Active"
    }

    this.mktApiService.addMarketingCareApprover(payload).subscribe((res: any) => {
      if (res) {

      }
    })
  }

  onApproversAction(userAction: string, dialogAction: string, dialogWidth: string): void {
    if (userAction == 'Reject') {
      this.dialog.open(CommonDialogueComponent, {
        width: dialogWidth,
        data: {
          action: dialogAction
        }
      }).afterClosed().subscribe((res: any) => {
        if (res && res.key == 'confirm') {
          this.onSubmitApproversResponse(MarketingApprovalStatusEnum.Rejected, res.data)
        } 
      })
    } else if (userAction == 'Approve') {
      this.onSubmitApproversResponse(MarketingApprovalStatusEnum.Approved, '')
    } else if (userAction == 'Onhold') {
      this.onSubmitApproversResponse(MarketingApprovalStatusEnum.Onhold, '')
    } else {
    }
  }

  setPermission(): void {
    this.canEdit = userUtility.hasPermission('Edit Campaign');
  }

  onSubmitApproversResponse(userAction: number, comments: string): void {
    const approverObj = this.approverList.find((item: any) => item.userId == this.loggedUser.sub)
    const approverDataObj = this.selectedApproverList.find((item: any) => item.approverUserId == this.loggedUser.sub)
    const payload = {

      CampaignId: this.campDetails.item.id,
      CampaignTypeApproverId: approverObj.id,
      Id: approverDataObj.id,
      ApproverUserId: approverObj.userId,
      MarketingApprovalStatus: userAction,
      RejectionNotes: userAction == MarketingApprovalStatusEnum.Rejected ? comments : ""
    }
    this.isSpinner = true;
    this.mktApiService.updateMarketingCareAprovers(payload).subscribe((res: any) => {
      if (res && res.data == '1') {
        this.toastr.successToastr('Successfully Updated', '', true);
        this.patchCampainDetails(this.campDetails.item.name,this.campDetails.item.campaignMarketingTypeId, true);
        this.router.navigate(['marketingcare/campaign'])
        this.isSpinner = false;
      } else {
        this.toastr.errorToastr(res.message, '', true);
        this.isSpinner = false;
      }
    })
  }

  onUpdateCampaign(payload: any): void {
    const finalPayload = { ...payload, id: this.campDetails.item.id }
    this.isSpinner = true;
    this.mktApiService.updateCampaign(finalPayload).subscribe((res: any) => {
      if (res && res.data == '1') {
        
        this.toastr.successToastr('Successfully Updated', '', true);
        this.isSpinner = false;
        this.router.navigate(['marketingcare/campaign'])
      } else {
        this.toastr.errorToastr(res.message, '', true);
        this.isSpinner = false;
      }
    })
  }

  searchValue(event: Event): void {
    let searchText: string = event.toString();

    if (searchText.length > 0) {
      const filterValue = searchText.toLowerCase();
      this.filteredOptions = this.filteredOptions.filter(o => o.campaignName.toLowerCase().includes(filterValue));
    } else {
      this.filteredOptions = this.campaignTypeList.slice();
    }

  }

  previewTemplate(template: any, action: string): void{
    this.isSpinner = true;
    this.mktApiService.getTemplateDetails(template.id).subscribe((res: any) => {
      if(res && res.data){
        const templateData = { 
          ...template,
          campaignName: this.campDetails.item.name,
          channelData: res.data,
          action: action
        }
        this.dataService.setTemplateData(templateData);
        this.isSpinner = false;
        this.router.navigate(['marketingcare/create-message-template']);
      }
    })
   
  }

  getTemplateDetails(): void{
    const templateData = this.dataService.getCampaignTemplateDetails();
    this.createdTemplateIds = templateData;
  }

  ngOnDestroy(): void{
    localStorage.removeItem('templateIdDetails')
  }

}

