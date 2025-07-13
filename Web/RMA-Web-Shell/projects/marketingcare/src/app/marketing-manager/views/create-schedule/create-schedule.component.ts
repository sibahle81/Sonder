import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketingCareService } from '../../services/marketingcare.service';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormBuilder, FormControl, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MarketingCampaignScheduleStatusEnum } from 'projects/shared-models-lib/src/lib/enums/campaign-schedule-status.enum';
import { MarketingAudienceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/marketing-aududience-type.enum';
import { format } from 'date-fns';
import { MarketingApprovalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/campaign-action.enum';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogueComponent } from '../common-dialogue/common-dialogue.component';
import { DataResponseEnum } from 'projects/shared-models-lib/src/lib/enums/data-response-enum';


interface contacts {
  memberNumber: string,
  contactName: string,
  contactNumber: string,
  designation: string,
  companyName: string,
  companyNumber: string,
  category: string,
  type: string
}

interface campaignForm {
  selectCampaign: FormControl<string | null>
  selectDate: FormControl<string | null>
}
interface paginationParams {
  page: number,
  pageSize: number,
  search: string
}
@Component({
  selector: 'app-create-schedule',
  templateUrl: './create-schedule.component.html',
  styleUrls: ['./create-schedule.component.css']
})
export class CreateScheduleComponent implements OnInit {
  @ViewChild(MatAutocomplete) auto!: MatAutocomplete;
  myControl = new UntypedFormControl();
  @ViewChild('selectUser', { static: true }) selectUser: ElementRef<HTMLInputElement>;
  filteredOptions: any[] = [];
  campaignList: any = [];
  
  campaignScheduleList: any;
  filteredCampaigns: any[] = [];
  showDropdown: boolean = false;
  isSpinner: boolean = false;
  campaignId: any = null;
  searchCampaign = [];
  campaignSchedule: any = {
    selectCampaign: '',
    date: '',
    isGroup: false,
    isContacts: false,
    campaignIds: ''
  }
  campaignScheduleObj: any = {}
  errorMsg = false
  campaignAudience: string = '';
  isLoaderLoading: boolean = false;
  searchControl = new FormControl();
  createScheduleForm: FormGroup;
  minDate = new Date();
  isCommonLoading = false;
  selectedItem: any;
  searchQuery = '';
  data: any[] = [];
  filteredData: any[] = this.data;
  searchTermControl = new FormControl();
  searchTermControlFinalApprover = new FormControl();

  searchText: string = '';
  searchResults: any[] = [];
  selectedItems: any[] = [];
  selectedGroup: string = null;
  selectedContactList = [];
  approvers: any;
  contacts: any;
  campaignType: any;
  isFormSubmitted = false
  isRecordNotFound = false;
  originalCampaignList: any[] = [];
  selectedContacts: contacts[] = [];
  availableRecords = [];
  approvedCampaignCount: number;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  pageSizeOptions: number[] = [5, 10, 20, 50, 55, 60, 70, 80];
  pageSize: number = 5;
  page: number = 1;
  totalItems: number = 0;
  hasMoreData: boolean = true;
  apiParams: paginationParams | undefined;
  searchValueText;
  @ViewChild('approversInput') approversInput!: ElementRef;
  @ViewChild('approversInputCotact') approversInputCotact!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  
  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private toastr: ToastrManager, 
    private marketingCareService: MarketingCareService, 
    private fb: FormBuilder,
    private readonly marketingApiService: MarketingcareApiService,
    private readonly dialog: MatDialog) {
    this.filterData();
    this.campaignId = this.route.snapshot.paramMap.get('campaignId')

  }

  ngOnInit(): void {
    this.isSpinner = true;

    this.getCampaignList()
    this.searchControl.valueChanges.subscribe((value) => {
      this.filterCampaigns(value);
    });

    this.getCreateScheduleForm();
    this.searchTermControl.valueChanges.subscribe((searchTerm) => {
      this.onSearchCampaignType(searchTerm);
    })
    this.searchTermControl = this.createSearchTermControl();
    this.searchTermControlFinalApprover = this.createSearchTermControl();
    this.originalCampaignList = [...this.campaignList];
  }
  getDefaultContactsListing() {
    const defaultContactsSearchTerm = '0'; 
    this.apiParams = {
      page: this.page,
      pageSize: this.pageSize,
      search: "0"
    }
    this.marketingCareService.searchContactApprover(this.apiParams).subscribe((res: any) => {
      if (res && res['data']) {
        this.clearSearchFinalApprover();
        this.isSpinner=false;
        this.dataSource = new MatTableDataSource(res['data']);
        this.totalItems = res.rowCount;
        this.hasMoreData = (this.page * this.pageSize) < this.totalItems;
        this.searchResults = res['data'].filter((item: any) =>
          !this.selectedItems.some((selectedItem: any) => selectedItem.rolePlayerId === item.rolePlayerId)
        );
        if (res['data'].length == 0) {
          this.isRecordNotFound = true;
        } else {
          this.isRecordNotFound = false;
        }
      } else {
        this.searchResults = [];
        this.isRecordNotFound = true;
      }
    });
  }
  
  getDefaultGroupsListing() {
    const defaultGroupsSearchTerm = '0'; 
    this.marketingCareService.searchGroupApprover(defaultGroupsSearchTerm).subscribe((res: any) => {

      if (res && res['data']) {
        this.isSpinner=false;
        this.searchResults = res['data'].filter((item: any) =>
          !this.selectedItems.some((selectedItem: any) => selectedItem.id === item.id)
        );
        if (res['data'].length == 0) {
          this.isRecordNotFound = true
        } else {
          this.isRecordNotFound = false
        }
      } else {
        this.searchResults = [];
        this.isRecordNotFound = true
      }
    });
  }
  onSearchCampaignType(searchTerm: string) {
    this.searchTermControlFinalApprover.setValue(searchTerm);
    this.campaignList = this.campaignList.filter(
      (option: any) => option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.onSearchInDropdown(searchTerm, null);
  }

  createSearchTermControl(initialValue?: string): FormControl {
    return new FormControl(initialValue || '');
  }
  toggleContactSelection(contact: contacts): void {
    const index = this.selectedContacts.findIndex((selectedContact) => selectedContact === contact);

    if (index === -1) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(index, 1);
    }
  }

  isSelected(contact: contacts): boolean {
    return this.selectedContacts.includes(contact);
  }
  getSelectedContactNames(): string {
    return this.selectedContacts.map(contact => contact.contactName).join(', ');
  }
  clearSearchFinalApprover() {
    this.searchTermControl.setValue('');
    this.createScheduleForm.get('approvers').setValue('');
    this.onSearchInDropdown(this.searchTermControlFinalApprover.value, null);
    this.getCampaignList();
  }
  onSearchInDropdown(searchTerm: string, index: number | null) {
    if (!searchTerm) {
      this.campaignList = [...this.originalCampaignList];
      return;
    }

    const filteredCampaigns = this.campaignList.filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.campaignList = filteredCampaigns;

  }

  filterData(): void {
    this.filteredData = this.data.filter((item) =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  onSaveMarketingSchedule() {
    this.isFormSubmitted = true
    let selectedIds;
    let selectedContacts;
    if (this.campaignType == MarketingAudienceTypeEnum[MarketingAudienceTypeEnum.Contacts].toLocaleLowerCase()) {
      selectedContacts = this.selectedContacts;
      this.selectedContactList = selectedContacts;
    }
    if (this.campaignType == MarketingAudienceTypeEnum[MarketingAudienceTypeEnum.Groups].toLocaleLowerCase()) {
      selectedIds = this.selectedItems
        .map(item => item.id)
        .join(',');
      this.selectedGroup = selectedIds;  
    }

    
    let memberIdList = [], members: string;
    if(selectedContacts){
      selectedIds = 0;
      memberIdList = selectedContacts.map((item) => item.contactNumber );
      members = memberIdList.join(',');
      this.marketingApiService.validateCampaignContacts(selectedIds,members).subscribe(res => {
        if(res && res?.data){
          this.availableRecords = res.data;
          if(this.availableRecords.length > 0){
            this.openRecordDailog();
          }else{
            this.createSchedule(this.selectedGroup,this.selectedContactList);
          }
        }
      })
    }else{
      members = '0';
      this.marketingApiService.validateCampaignScheduleGroup(selectedIds,members).subscribe(res => {
        if(res && res?.data){
          this.availableRecords = res.data;
          if(this.availableRecords.length > 0){
            this.openRecordDailog();
          }
          else{
            this.createSchedule(this.selectedGroup,this.selectedContactList);
          }
        }
      })

    }
  }

  createSchedule(selectedIds,selectedContacts): void{
    this.isSpinner = true;
    const startDate = format(new Date(this.createScheduleForm.value.date), 'yyyy-MM-dd')
    if (this.createScheduleForm.valid) {
      let payload = {
        "CampaignId": this.createScheduleForm.value.selectCampaign,
        "CampaignName": '',
        "MarketingAudienceTypeId": this.campaignType == 'groups' ? MarketingAudienceTypeEnum.Groups : MarketingAudienceTypeEnum.Contacts,
        "CampaignGroupIds": selectedIds ? selectedIds : '',
        "ChannelName": "",
        "Groups": "",
        "StartDate": startDate,
        "CampaignContactIds": selectedContacts ? selectedContacts : '',
        "MarketingCampaignScheduleStatus": MarketingCampaignScheduleStatusEnum.Pending
      }

      this.isLoaderLoading = true
      this.marketingCareService.AddMarketingCareCmpgnSchedule(payload).subscribe(res => {
        this.isLoaderLoading = false;
        if (res && res.data == "1") {
          this.isSpinner = false;
          this.toastr.successToastr('Campaign has been scheduled successfully.', '', true);
          this.router.navigate(['marketingcare/scheduled-campaign'])
          this.campaignScheduleList = res.data;
          this.errorMsg = true;
          this.campaignSchedule.selectCampaign =
            this.campaignScheduleObj = {}


          if (this.campaignSchedule.selectCampaign && this.campaignSchedule.date && this.campaignSchedule.isGroup && this.campaignSchedule.isContacts && this.campaignSchedule.campaignIds) {
            this.campaignScheduleObj = true;

          } else {
            if (!this.campaignSchedule.selectCampaign) {
              this.campaignScheduleObj.selectCampaign = false
            }
            else if (!this.campaignSchedule.date) {
              this.campaignScheduleObj.date = false
            }
            else if (!this.campaignSchedule.isGroup) {
              this.campaignScheduleObj.isGroup = false
            }
            else if (!this.campaignSchedule.isContacts) {
              this.campaignScheduleObj.isContacts = false
            }
            else if (!this.campaignSchedule.campaignIds) {
              this.campaignScheduleObj.campaignIds = false
            }
            this.isSpinner = false;
          }
        }
      })
    } else {
      this.isSpinner = false;
    }
  }

  openRecordDailog(): void{
    this.dialog.open(CommonDialogueComponent, {
      width: '55vw',
      data: {
        data: this.availableRecords,
        action: MarketingApprovalStatusEnum[MarketingApprovalStatusEnum.Approved],
        typeOfAudience: this.campaignType
      }
    }).afterClosed().subscribe(res => {
      if(res && res.key == DataResponseEnum[DataResponseEnum.Success]){
        this.createSchedule(this.selectedGroup,this.selectedContactList);
      }
    })
  }

  getCampaignList() {
    this.isLoaderLoading = true;
    this.isSpinner = true;
    this.marketingCareService.getCampaignsList(this.page, this.pageSize, "StartDateAndTime", "asc", "0").subscribe(res => {
      if (res && res.data) {
        this.isSpinner = false;

        this.campaignList = res.data;
        const approveDataCount = res.data.filter((item: any) => item.status == MarketingApprovalStatusEnum[MarketingApprovalStatusEnum.Approved]);
        this.approvedCampaignCount = approveDataCount?.length;
        this.originalCampaignList = [...this.campaignList];
        if (this.campaignId != null) {
          this.createScheduleForm.get('selectCampaign').setValue(Number(this.campaignId));

        }
      }

      this.isLoaderLoading = false

    })
  }

  onSearchChange(searchValue: string): void {
    this.isSpinner = true;
    if (searchValue?.length > 0) {
      this.isCommonLoading = true;
      if (this.campaignType == 'groups') {
        this.isSpinner = true;
        this.marketingCareService.searchGroupApprover(searchValue).subscribe((res: any) => {
          this.isCommonLoading = false;
          if (res && res['data']) {
            this.isSpinner = false;
            this.searchResults = res['data'].filter((item: any) =>
              !this.selectedItems.some((selectedItem: any) => selectedItem.id === item.id)
            );
            if (res['data'].length == 0) {
              this.isRecordNotFound = true
              this.isSpinner = false;
            } else {
              this.isRecordNotFound = false
              this.isSpinner = false;
            }
          } else {
            this.searchResults = [];
            this.isRecordNotFound = true
            this.isSpinner = false;
          }
        });
      } else {
        this.isCommonLoading = true;
        this.apiParams = {
          page: this.page,
          pageSize: this.pageSize,
          search: searchValue
        }
        this.isSpinner = true;
        this.marketingCareService.searchContactApprover(this.apiParams).subscribe((res: any) => {
          this.isSpinner = true;

          this.isCommonLoading = false;
          this.isSpinner = true;
          if (res && res['data']) {
            this.isSpinner = false;
            this.searchResults = res['data'].filter((item: any) =>
              !this.selectedItems.some((selectedItem: any) => selectedItem.rolePlayerId === item.rolePlayerId)
            );
            if (res['data'].length == 0) {
              this.isRecordNotFound = true;
              this.isSpinner = false;
            } else {
              this.isRecordNotFound = false;
              this.isSpinner = false;
              
            }
          } else {
            this.searchResults = [];
            this.isRecordNotFound = true;
            this.isSpinner = false;
          }
        });
      }

    } else {
      this.searchResults = [];
      this.isRecordNotFound = false;
      this.isSpinner = false;
    }
  }
  handlePaginatorEventContact(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getDefaultContactsListing()

  }
  clearSearchInput(): void {
    this.approvers = '';
    this.approversInput.nativeElement.value = ''; 
  }
  addEmailToSelectedItems(email: any, reqType: string = null): void {
    let newItem: any;
    if (reqType == 'edit') {
      if (email.attendeesEmail && this.isValidEmail(email.attendeesEmail)) {
        newItem = {
          displayName: email.attendeesName,
          email: email.attendeesEmail,
          id: -1,
          userName: '',
        };
        if (!this.selectedItems.some((selectedItem: any) => selectedItem.email === email.attendeesEmail)) {
          this.selectedItems.push(newItem);
        }
      }
    } else {
      if (email && this.isValidEmail(email)) {
        newItem = {
          category: email,
          type: email.type,
          id: -1,
          companyName: '',
          contactDesignationTypeId: '',
          contactName: '',
          contactNumber: email.contactNumber,
          designation: '',
          emailAddress: email,
          memberNumber: '',
          rolePlayerId: -1,
          companyno: email.companyno
        };
        if (!this.selectedItems.some((selectedItem: any) => selectedItem.email === email)) {
          this.selectedItems.push(newItem);
          this.clearSearchInput();

        }
      }
    }
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  addSelectedItem(item: any): void {
    if (!this.selectedItems.includes(item)) {
      this.selectedItems.push(item);
      this.approversInput.nativeElement.value = '';

      this.approvers = '';
      this.getCampaignTypeItemValidators()
      this.searchResults = [];
    }
    if (!this.searchResults.includes(item)) {
      this.searchResults.push(item);

      this.approvers = '';
      this.getCampaignTypeItemValidators()
      this.searchResults = [];
    }
  }

  removeSelectedItem(item: any): void {
    const index = this.selectedItems.indexOf(item);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
    }
    this.getCampaignTypeItemValidators()
  }
  removeSelectedItemContacts(selectedContact: contacts): void {
    const index = this.selectedContacts.indexOf(selectedContact);
    if (index !== -1) {
      this.selectedContacts.splice(index, 1);
    }
  }
  isContactAlreadyDisplayed(selectedContact: contacts): boolean {
    return this.getSelectedContactNames().includes(selectedContact.contactName);
  }
  getCampaignTypeItemValidators(formType: any = null) {
    if (this.selectedItems?.length > 0) {
      if (formType == 'edit') {
        this.createScheduleForm.get('approvers')!.setValidators(null);
      } else {
        this.createScheduleForm.get('approvers')!.setValidators(null);
      }
    } else {
      if (formType == 'edit') {
        this.createScheduleForm.get('approvers')!.setValidators(Validators.required);
      } else {
        this.createScheduleForm.get('approvers')!.setValidators(Validators.required);
      }
    }
    this.createScheduleForm.get('approvers')!.updateValueAndValidity();
  }

  selectCampaignAudience(value: boolean, campgnType): void {
    this.isSpinner=true;
    this.campaignAudience = value.toString();
    this.campaignType = campgnType
      if(campgnType=="groups"){
        this.isSpinner=true;
        this.getDefaultGroupsListing();
      }else{
        this.isSpinner=true;
        this.getDefaultContactsListing();
      }
    this.searchResults = [];
    this.selectedItems = []

  }

  createTemplate(): void {
    this.router.navigate(['marketingcare/create-message-template'])
  }

  createGroup(): void {
    this.router.navigate(['marketingcare/create-groups'], { queryParams: { source: 'schedule' } });

  }

  goBack(): void {
    this.router.navigate(['marketingcare/scheduled-campaign'])
  }

  filterCampaigns(value: string): void {
    this.isSpinner = false;

    this.filteredCampaigns = this.searchCampaign.filter((option) =>
      option.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  displayFn(option: any): string {
    return option ? option.name : '';
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void {
    this.campaignScheduleObj.campaignIds = event.option.value;
this.clearSearchFinalApprover()
  }

  getCreateScheduleForm() {
    this.isSpinner = true;
    this.createScheduleForm = this.fb.group({
      selectCampaign: ['', Validators.required],
      date: ['', Validators.required],
      campaignAudience: ['', Validators.required],
      approvers: ['']
    })
  }

  validateSelectCampaign() {
    return this.createScheduleForm.get('selectCampaign').touched && this.createScheduleForm.get('selectCampaign').invalid
  }
  validateDate() {
    return this.createScheduleForm.get('date').touched && this.createScheduleForm.get('date').invalid
  }
  validateCampaignAudience() {
    const control = this.createScheduleForm.get('campaignAudience');
    return control.invalid && (control.touched || control.dirty);
  }
  validateApprovers() {
    return this.createScheduleForm.get('approvers').touched && this.createScheduleForm.get('approvers').invalid
  }

}


