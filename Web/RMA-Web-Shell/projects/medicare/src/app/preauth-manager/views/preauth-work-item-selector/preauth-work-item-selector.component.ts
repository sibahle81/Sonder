import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DigiCareMasterDataService } from 'projects/digicare/src/app/digi-manager/services/digicare-master-data.service';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { WorkItemType } from 'projects/digicare/src/app/work-manager/models/work-item-type';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { Observable } from 'rxjs';
import { PreAuthorisation } from '../../models/preauthorisation';

@Component({   
    selector: 'preauth-work-item-selector',
    templateUrl: './preauth-work-item-selector.component.html',
    styleUrls: ['./preauth-work-item-selector.component.css']
  })
  export class PreAuthWorkItemSelectorComponent implements OnInit {
    form: UntypedFormGroup;
    isLoading: boolean;
    loadingMsg: string;
    workItemTypes: WorkItemType[];
    selectedWorkItemType: WorkItemType;

    constructor(private readonly digiCareService: DigiCareService,
      private readonly wizardService: WizardService,
      private readonly authorizationService: AuthService,
      private readonly userService: UserService,
      private readonly digiCareMasterDataService: DigiCareMasterDataService,
      private readonly wizardConfigurationService: WizardConfigurationService,
      private readonly formBuilder: UntypedFormBuilder,
      private readonly router: Router){}

    ngOnInit(): void {
      this.setupState();
      this.setupForm();
      this.setupView();
    }

    setupState():void{
      this.isLoading=false;
      this.loadingMsg="";
      this.workItemTypes=[];
    }

    setupView():void{
      this.isLoading=true;
      this.loadingMsg="Loading types...";
      this.digiCareMasterDataService.getWorkItemTypes().subscribe(workItemTypes=>{
        this.workItemTypes = workItemTypes;
        this.isLoading=false;
        this.loadingMsg="";
      });
    }

    setupForm():void{
      if (this.form) { return; }

      this.form = this.formBuilder.group({
        workItemTypeId: new UntypedFormControl('', [Validators.required])
      });
    }

    onSelectedWorkItemType(evt:any):void {
      if (evt) this.selectedWorkItemType = evt.value;
    }

    onStartClick():void{
      this.isLoading=true;
      this.loadingMsg="Loading wizard...";
      this.startWizard(this.selectedWorkItemType).then(x=>{
        this.isLoading=false;
        this.loadingMsg="";
      });
    }

    startWizard(authWorkItemType: WorkItemType):Promise<any>{

      let that = this;  // 'this' has a different meaning inside the callbacks provided 'then()'

      let currentUser = this.authorizationService.getCurrentUser();

      let promise = new Promise(function(resolve){
        let tpromise = that.userService.getTenant(currentUser.email).toPromise();
        let wcpromise = that.wizardConfigurationService.getWizardConfiguration(authWorkItemType.wizardConfigurationId).toPromise();
        wcpromise.then( wizardConfig=> { tpromise.then( tenant=>{

            // Having asyncronously retrieved all required information, pass it to the waiting subscriber's
            //   notification callback

            resolve( { wizardConfigName: wizardConfig.name, workItemType: authWorkItemType, tenant: tenant } );
          });
        });
      });


      let resultPromise=new Promise(function(resolve){
        // Wait for the async fetches to complete at which point our callback is invoked with the retrieved results
        promise.then((blob:any)=>{
          that.saveWorkItem(blob.wizardConfigName, blob.workItemType, blob.tenant).then(x=>{resolve(true);});},
          function(reason:string) {throw `Failed to start the wizard. ${reason}`;});
      });

      // Return the promise that is resolved when 'saveWorkItem()' completes its async request
      return resultPromise;
    }

    saveWorkItem(wizardConfigName: string, workItemType: WorkItemType,tenant:Tenant):Promise<number> {

      let workItem = new WorkItem();
      workItem.workItemName = `${workItemType.workItemTypeName} ${this.formatDate(new Date())}`;
      workItem.workItemType = workItemType;
      workItem.workItemState = WorkItemStateEnum.InProgress;
      workItem.tenantId = tenant.id;

      let that = this;
      let promise = this.digiCareService.addWorkItem(workItem).toPromise();//.subscribe((workItemId) => {
      promise.then(workItemId=>{
        const startWizardRequest = new StartWizardRequest(); let wizardModel = new PreAuthorisation();
        startWizardRequest.data = JSON.stringify(wizardModel);
        startWizardRequest.linkedItemId = workItemId;
        startWizardRequest.type = wizardConfigName;

        that.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
          this.router.navigateByUrl(`medicare/work-manager/${wizardConfigName}/continue/${wizard.id}`);
        });
      });

      return promise;
    }

    getPreAuthWorkItemType(workItemTypes:WorkItemType[]):WorkItemType {

      let index = workItemTypes.findIndex(x=>{if(x.workItemTypeName.indexOf("auth") >= 0)return true;return false;});

      if(index < 0) throw `Failed to identify the '${WorkItemType.name}' category for 'PreAuth'`;

      return workItemTypes[index];
    }

    formatDate(date) {
      // returns the date as a string in the form of 'yyyy-MM-dd'
      let x = [ "0" + (date.getMonth() + 1), "0" + date.getDate() ].map( y => y.slice(-2) );
      return date.getFullYear() + "-" + x.slice(0, 2).join("-");
    }

  }
