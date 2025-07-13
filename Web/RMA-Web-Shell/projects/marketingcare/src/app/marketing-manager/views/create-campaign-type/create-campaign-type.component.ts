import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, UntypedFormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription, timer } from 'rxjs';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MatDialog } from '@angular/material/dialog';
import { MarketingCareService } from '../../services/marketingcare.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime, switchMap } from 'rxjs/operators';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

interface CampaignTypeForm {
  campaignType: FormControl<string | null>;
}
interface Role {
  id: string;
  name: string;
}
function uniqueApproversValidator(control: FormGroup): ValidationErrors | null {
  const finalApprover = control.get('finalapprover').value;
  const approverValues = control.get('inputFields').value
    .filter((field: { approvers: string }) => field.approvers)
    .map((field: { approvers: string }) => field.approvers);
  if (finalApprover !== null && finalApprover !== undefined) {
    approverValues.push(finalApprover);
  }
  const hasDuplicates = new Set(approverValues).size !== approverValues.length;
  return hasDuplicates ? { duplicateApprovers: true } : null;
}

@Component({
  selector: 'app-create-campaign-type',
  templateUrl: './create-campaign-type.component.html',
  styleUrls: ['./create-campaign-type.component.css']
})
export class CreateCampaignTypeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  createCampaignTypeForm: FormGroup;
  isEditMode: boolean = false;
  campaignTypeId: number;
  formSubmitted: boolean;
  isSpinner: boolean = false;
  approverOptions: any[] = [];
  finalApprover: any;
  approverOptionsFiltered: any[] = [];
  finalApproverOptionsFiltered
  groupUpdateData: any;
  index: number = 0;
  roles: Role[] = [];
  editCampaignTypeForm: FormGroup;
  approverList: any[];
  filteredApprovers: any[][] = [];
  productList$: Observable<any>[] = [];
  myControl = new UntypedFormControl();
  approverOptionsFilteredFinalApprover: any[] = [];
  canEdit: boolean;

  @ViewChild('selectUser', { static: true }) selectUser: ElementRef<HTMLInputElement>;
  @ViewChild('stateInput') inputField: ElementRef;
  myControlFinalApprover = new UntypedFormControl();
  @ViewChild('stateInput', { static: true }) stateInput: ElementRef<HTMLInputElement>;
  myControlApprover = new UntypedFormControl();

  @ViewChild('selectUserFinalApprover', { static: true }) selectUserFinalApprover: ElementRef<HTMLInputElement>;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private mktApiService: MarketingcareApiService,
    private readonly toastr: ToastrManager,
    public dialog: MatDialog,
    private marketingCareService: MarketingCareService
  ) { }

  ngOnInit(): void {
    this.isSpinner = true;
    this.setPermission();

    this.loadApproverOptions();
    this.getCreateCampaignTypeForm();
    this.groupUpdateData = this.marketingCareService.getGroupUpdateData()


    this.groupUpdateData = this.marketingCareService.getGroupUpdateData();

    if (this.groupUpdateData) {
      this.isEditMode = true;
      this.getCreateCampaignTypeEditForm();
      this.createCampaignTypeForm.patchValue({
        campaignType: this.groupUpdateData.campaignType,
        finalapprover: this.groupUpdateData.finalApprover,
      });
      this.fetchAndPatchData();


    }

    this.approverOptionsFiltered = [...this.approverOptions];
    this.approverOptionsFilteredFinalApprover = [...this.approverOptions];

    for (let i = 0; i < this.inputFieldsArray.controls.length; i++) {
      this.filteredApprovers.push([]);
    }

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  getCreateCampaignTypeForm(): void {
    this.createCampaignTypeForm = this.fb.group({
      campaignType: ['', Validators.required],
      inputFields: this.fb.array([this.addProductGroup(0)]),
      finalapprover: ['', Validators.required],
    }, { validators: [uniqueApproversValidator] });

  }
  searchValueAppover(event: Event): void {
    let searchText: string = event.toString();
    if (searchText.length > 0) {
      const filterValue = searchText.toLowerCase();
      this.approverOptionsFiltered = this.approverOptionsFiltered.filter(o => o.userName.toLowerCase().includes(filterValue));
    }
  }
  fetchAndPatchData() {
    this.isSpinner = true;

    this.subscriptions.push(
      this.mktApiService.getCampaignTypeApproverById(this.groupUpdateData.id,0).subscribe((dropdownData: any) => {
        if (dropdownData) {
          this.isSpinner = true;
          const uniqueApproverList = this.getUniqueApproverList(dropdownData.data, 'roleId');
          this.approverList = uniqueApproverList;
          this.patchFormValue();

        }
      }, (error) => {
      })
    );
  }

  patchFormValue() {
    this.isSpinner = true;

    const campaignId = this.groupUpdateData.id;
    if (this.groupUpdateData && this.editCampaignTypeForm) {
      this.isSpinner = false;
      const { name, finalApprover, approvers } = this.groupUpdateData;

      this.editCampaignTypeForm.patchValue({
        campaignType: name,
        finalapprover: this.groupUpdateData.finalApprover,
      });

      const inputFieldsArray = this.editCampaignTypeForm.get('inputFields') as FormArray;
      const normalApprovers = approvers.split(',').map(approver => approver.trim());

      const finalApproverdata = this.approverList.find(data => data.approverType === 'F');
      normalApprovers.forEach(data => {
        const approverGroup = this.fb.group({
          approvers: [data, Validators.required],
        });
        inputFieldsArray.push(approverGroup);
      });
      if (finalApproverdata) {
        this.editCampaignTypeForm.patchValue({
          finalapprover: finalApproverdata.roleName,
        });
      }

    }
  }
  canAddInput(): boolean {
    const maxInputs = 5;
    return this.inputFieldsArray.length < maxInputs;
  }
  canAddInputEdit(): boolean {
    const maxInputs = 5;
    const inputFieldsArray = this.editCampaignTypeForm.get('inputFields') as FormArray;
    return inputFieldsArray.length < maxInputs;
  }
  
  getCreateCampaignTypeEditForm(): void {
    this.editCampaignTypeForm = this.fb.group({
      campaignType: [this.groupUpdateData.campaignType, Validators.required],
      inputFields: this.fb.array([]),
      finalapprover: [this.groupUpdateData.finalApprover, Validators.required],
    }, { validators: [uniqueApproversValidator] });
  }
  resetFormValue() {
    const data = null;
    this.marketingCareService.setGroupUpdateData(data);
  }
  getUniqueApproverList(approverList: any[], property: string): any[] {
    const uniqueValues = new Map();
    approverList.forEach(approver => {
      uniqueValues.set(approver[property], approver);
    });
    return Array.from(uniqueValues.values());
  }
  get inputFieldsArray() {
    return this.createCampaignTypeForm.get('inputFields') as FormArray;
  }
  addProductGroup(index): FormGroup {
    const newField = this.fb.group({
      approvers: ['', Validators.required],
    });

    this.productList$[index] = newField.get("approvers").valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this.mktApiService.getDropdownValues())
    );

    return newField;
  }
  addInputField() {

    this.inputFields.push(this.addProductGroup(this.inputFields.length));

  }

  addInputFieldEdit(event: Event) {
    try {
      event.preventDefault();
      const inputFieldsArray = this.isEditMode
        ? this.editCampaignTypeForm.get('inputFields') as FormArray
        : this.createCampaignTypeForm.get('inputFields') as FormArray;
      const hasDefaultInputField = inputFieldsArray.length > 0 && this.isDefaultInputField(inputFieldsArray.at(0) as FormGroup);
      if (!hasDefaultInputField) {
        inputFieldsArray.push(this.addProductGroup(this.inputFields.length));

      }
    } catch (error) {
    }
  }
  private isDefaultInputField(field: FormGroup): boolean {
    return field.get('approvers').value === 'initialValue';
  }

  get inputFields(): FormArray {
    return this.createCampaignTypeForm.get('inputFields') as FormArray;
  }
  createInputField(initialValue?: string): FormGroup {
    const field = this.fb.group({
      approvers: [null, Validators.required],
    });

    return field;
  }

  removeInput(index: number) {
    return this.inputFields.removeAt(index);

  }
  setPermission(): void {
    this.canEdit = userUtility.hasPermission('Edit Campaign Type');

  }
  filterApproversInEditForm(searchTerm: string, index: number): void {
    const approverOptions = this.approverOptionsFiltered;
    this.filteredApprovers[index] = approverOptions.filter(
      approver => approver.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  removeInputFieldAtIndex(index: number, event: Event) {
    event.preventDefault();
    const inputFields = this.editCampaignTypeForm.get('inputFields') as FormArray;
    inputFields.removeAt(index);
  }
  loadApproverOptions() {
    this.subscriptions.push(
      this.mktApiService.getDropdownValues().subscribe((response) => {
        if (response && response.data) {
          this.isSpinner = false;
          this.approverOptions = Array.isArray(response.data) ? response.data : [];
          this.approverOptionsFiltered = [...this.approverOptions];
          this.finalApproverOptionsFiltered = [...this.approverOptions];
          this.approverOptionsFilteredFinalApprover = [...this.approverOptions];

        }
      })
    );
  }
  filterApproverOptions(searchTerm: string, index: number): void {
    const approverOptions = this.approverOptionsFiltered;

    this.filteredApprovers[index] = searchTerm.trim() === ''
      ? approverOptions
      : approverOptions.filter(
        approver => approver.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );

  }
  filterFinalApproverOptions(searchTerm: string) {
    this.finalApproverOptionsFiltered = this.approverOptions.filter((option) =>
      option.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  selectApprover(selectedValue: string, index: number): void {
    const roleId = this.getRoleIdByName(selectedValue);
    const inputFieldsArray = this.createCampaignTypeForm.get('inputFields') as FormArray;
    const inputField = inputFieldsArray.at(index) as FormGroup;
    inputField.get('roleId').setValue(roleId);

  }
  saveCampaignType() {
    this.formSubmitted = true;
    if (this.createCampaignTypeForm.valid) {
      this.addCampaign();
    }
    if (this.isEditMode) {
      this.updateCampaignType();
    }
  }
  onApproverSelected(approverId: number, isEdit: boolean, checkVal: number): void {
    const selectedApprover = this.approverOptions.find(approver => approver.id === approverId);
    if (selectedApprover) {
      this.createCampaignTypeForm.get('finalapprover').setValue(selectedApprover.userName);
    }

  }
  handleApproverInputFocus(i: number): void {
    this.filterApproverOptions('', i);
  }
  handleFinalApproverInputFocus(): void {
    this.filterFinalApproverOptions('');
  }
  searchValueFinalApprover(event: Event): void {
    let searchText: string = event.toString().trim();
    if (searchText.length > 0) {
      const filterValue = searchText.toLowerCase();
      this.approverOptionsFilteredFinalApprover = this.approverOptions.filter(o => o.userName.toLowerCase().includes(filterValue));
    }

  }
  getRoleIdByName(roleName: string): string | null {

    const role = this.roles.find((r) => r.name === roleName);


    return role ? role.id : null;
  }
  addCampaign() {

    const campaignType = this.createCampaignTypeForm.value.campaignType;

    const inputFields = this.createCampaignTypeForm.value.inputFields.map((field) => {
      const selectedApprover = this.approverOptions.find(approver => approver.userName === field.approvers);
      const roleId = selectedApprover ? selectedApprover.id : null;
      return {
        roleId: roleId,
      };
    });

    const approverList = inputFields.map((field) => ({
      ApproverType: 'N',
      RoleId: field.roleId,
    }));



    const finalApproverRoleId = this.createCampaignTypeForm.value.finalapprover;
    const selectedFinalApprover = this.approverOptions.find(approver => approver.userName === finalApproverRoleId);
    const finalApprover = {
      ApproverType: 'F',
      RoleId: selectedFinalApprover ? selectedFinalApprover.id : null,
    };



    const payload = {
      Name: campaignType,
      CampaignTypeApproverList: [...approverList, finalApprover],
    };

    this.approverList = payload.CampaignTypeApproverList;



    this.isSpinner = true;
    this.mktApiService.addCampaignType(payload).subscribe((res: any) => {
      if (res && res.data === 1) {
        this.isSpinner = false;
        this.toastr.successToastr('Campaign type added successfully.', '', true);

        this.router.navigate(['marketingcare/create-campaign-type']);

      } else {
        this.isSpinner = false;

        this.toastr.errorToastr(res.message);
      }
    }, (error) => {
      this.toastr.errorToastr('Same Campaign Type Already Exist. Please add different campaign Type.');
      this.isSpinner = false;
    });
  }


  updateCampaignType() {
    const campaignId = this.groupUpdateData.id;
    const campaignType = this.editCampaignTypeForm.value.campaignType;
    if (this.editCampaignTypeForm) {
      const finalApproverControl = this.editCampaignTypeForm.get('finalapprover');

      const finalApproverValue = finalApproverControl.value;

      const selectedFinalApprover = this.approverOptions.find(approver => approver.userName === finalApproverValue);
      const finalApproverRoleId = selectedFinalApprover ? selectedFinalApprover.roleId : null;
      const inputFields = this.editCampaignTypeForm.value.inputFields.map((field) => {
        const selectedApprover = this.approverOptions.find(approver => approver.userName === field.approvers);
        return { roleId: selectedApprover ? selectedApprover.roleId : null };
      });
      const payload = {
        Id: campaignId,
        Name: campaignType,
        CampaignTypeApproverList: [
          ...inputFields.map((approver) => ({ ApproverType: 'N', RoleId: approver.roleId.toString() })),
          { ApproverType: 'F', RoleId: finalApproverRoleId }
        ]
      };
      this.isSpinner = true;
      if(this.editCampaignTypeForm.valid){
      this.subscriptions.push(
        this.mktApiService.updateCampaignType(this.campaignTypeId, payload).subscribe((res: any) => {
          if (res && res.data === 1) {
            this.isSpinner = false;
            this.toastr.successToastr('Campaign type updated successfully.', '', true);
            this.router.navigate(['marketingcare/create-campaign-type']);
          } else {
            this.isSpinner = false;

            this.toastr.errorToastr(res.message);

          }
        })
      );
        }else{
          this.isSpinner = false;
          
        }
    }
  }
  getErrorMessage(controlName: string): string {
    const control = this.createCampaignTypeForm.get(controlName);
    if (control && control.errors) {
      if (control.hasError('required') || null) {
        return 'This field is required.';
      }
    }
    return '';
  }
  isControlInvalidType(controlName: string): boolean {
    const control = this.createCampaignTypeForm.get(controlName);
    return !!(control && control.invalid);
  }

  goBack(): void {
    this.router.navigate(['marketingcare/create-campaign-type']);
  }
}
