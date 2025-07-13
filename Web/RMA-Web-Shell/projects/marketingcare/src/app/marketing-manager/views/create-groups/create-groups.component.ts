import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MarketingCareService } from '../../services/marketingcare.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Router } from '@angular/router';
import { MarketingcareApiService } from '../../services/marketingcare-api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-groups',
  templateUrl: './create-groups.component.html',
  styleUrls: ['./create-groups.component.css']
})
export class CreateGroupsComponent implements OnInit, OnDestroy {
  errorMsg!: string;
  entityErrorMsg!: string;
  isLoaderLoading = false

  entityArr: any = []
  valueArr: any = []

  isAgeSelected: boolean = false

  selectedValue: any

  groupUpdateData: any
  selectedOption: string;
  entityCondition: any = []
  filterOperators: any = []
  selectedDropdownOption: any;
  conditionDropDownOperators: any[] = []

  isOperatorRequired: boolean = false
  isSpinner: boolean = false

  formSubmited: boolean = false

  dropdownValuesMap = new Map()
  patchValuesForConditions: { groupName: any; groupList: any[] } = { groupName: '', groupList: [] };
  private sourcePage: string = '';
  constructor(private marketingCareService: MarketingCareService, private fb: FormBuilder, private api: MarketingcareApiService,
     private toastr: ToastrManager,private cdRef: ChangeDetectorRef, private route: ActivatedRoute,
    private router: Router) { }


  ngOnDestroy(): void {
    this.createGroupForm.reset();
  }

  ngOnInit(): void {
    this.addGroup(0);
    this.entityDropdowmList();
    this.groupUpdateData = this.marketingCareService.getGroupUpdateData()
    if (this.groupUpdateData) {
      this.patchFormValue()
    } else {
      this.resetFormValue();
    }


    const groupNameControl = this.createGroupForm.get('groupName');
    groupNameControl?.valueChanges.subscribe(res => {

    })

    const entityControl = this.createGroupForm.get('entity');
    this.route.queryParams.subscribe(params => {
      this.sourcePage = params['source'] || '';
    });

  }
  title = 'create-group';


  createGroupForm: FormGroup = new FormGroup({
    groupName: new FormControl('', Validators.required),
    groupList: new FormArray<any>([])
  });

  createGroup() {

    const abc = this.createGroupForm?.get('groupList') as FormArray

    const groupListArr = []

    for (let i = 0; i < this.groupListArray().controls.length; i++) {
      groupListArr.push({
        entity: abc.at(i).value.entity,
        conditionOperator: abc.at(i).value.conditionOperator,
        value: abc.at(i).value.value,
        operator: abc.at(i).value.operator
      })

    }

    if (this.createGroupForm.valid) {

      this.isSpinner = true
      let groupObj = {
        GroupName: this.createGroupForm.controls['groupName'].value,
        GroupConditionList: groupListArr
      }

      this.marketingCareService.AddMarketingCareCmpgnGroup(groupObj).subscribe(res => {
        this.isLoaderLoading = false
        if (res && res.data == "1") {
          this.toastr.successToastr('Group has been created successfully.', '', true);

          this.goBack();
        } else {
          this.isSpinner = false
          this.toastr.errorToastr(res.message);
        }
      })
    }


  }


  entityDropdowmList() {
    this.api.getMarketingCareGroupConditionEntity().subscribe((res) => {
      this.isSpinner=true;
      if (res) {
        this.isSpinner=false;
        this.entityArr = res['data'];
        for (let i = 0; i < this.entityArr.length; i++) {
          this.conditionDropdown(this.entityArr[i].entityName, i);
        }
      }
    })
  }

  validateInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  onInputChange(value: string, index: number) {


    if (value == 'Age') {
      this.isAgeSelected = true;
    } else {
      this.isAgeSelected = false;
    }

    this.conditionDropdown(value, index);

    this.selectedOption = value;

    this.getValueDropdownList(value, index)

  }


  getValueDropdownList(option: string, index: number) {

    this.api.getMarketingCareGroupConditionEntityDetails(option).subscribe((res) => {
      this.isSpinner=true;
      if (res) {
        this.isSpinner=false;
        const temp = this.dropdownValuesMap.get(index)
        this.dropdownValuesMap.set(index, {
          ...temp,
          value: res['data']
        })
        this.valueArr = res['data']
      }


    })
  }

  conditionDropdown(value: string, index: number) {
    this.api.getMarketingCareGroupConditionEntityDetails(value).subscribe((res) => {
      this.isSpinner=true;
      if (res) {
        this.isSpinner=false;
        const tempArr = res['data'];
        this.dropdownValuesMap.set(index, {
          conditions: tempArr
        });
        this.conditionDropDownOperators = tempArr;
      }
    });
  }
  getConditionsDropdownValuesByIndex(index: number) {
    return [...this.dropdownValuesMap.get(index).conditions] || []
  }

  getValueDropdownValuesByIndex(index: number) {
    return [...this.dropdownValuesMap.get(index).value] || []
  }

  patchFormValue() {
    this.isSpinner = true;
    setTimeout(() => { 
        this.api.getGroupDataById(this.groupUpdateData.id).subscribe((res: any) => {
            if (res) {
                const groupList = [];
                res.data.forEach(element => {
                    const temp: any = {
                        entity: element.entity,
                        operator: element.operator,
                        value: element.value
                    };

                    temp.conditionOperator = element.conditionOperator;
                    if (element.entity === 'Age') {
                        this.isAgeSelected = true;
                    } else {
                        this.isAgeSelected = false;
                    }
                    groupList.push(temp);
                });

                const patchObject = {
                    groupName: this.groupUpdateData.groupName,
                    groupList: groupList
                };

                this.patchValuesForConditions = patchObject;

                this.createGroupForm.patchValue(patchObject);

                for (let i = 0; i < groupList.length - 1; i++) {
                    this.addGroup(i);
                    const abc = this.createGroupForm.get('groupList') as FormArray;
                    abc.at(i).patchValue(groupList[i]);
                }

            }
          });
    }, 2000); 
}

  resetFormValue() {
    const data = null
    this.marketingCareService.setGroupUpdateData(data);
    this.formSubmited = false;
  }

  updateGroup() {
    const abc = this.createGroupForm.get('groupList') as FormArray
    const groupListArr = []
    for (let i = 0; i < this.groupListArray().controls.length; i++) {
      groupListArr.push({
        entity: abc.at(i).value.entity,
        conditionOperator: abc.at(i).value.conditionOperator,
        value: abc.at(i).value.value,
        operator: abc.at(i).value.operator
      })
    }

    if (this.createGroupForm.valid) {
      this.isSpinner = true
      let groupObj = {
        Id: this.groupUpdateData.id,
        GroupName: this.createGroupForm.controls['groupName'].value,
        GroupConditionList: groupListArr,
      }

      const payloadForGroupName = {
        GroupName: this.createGroupForm.controls['groupName'].value,
      }

      const payloadForGroupConditions = {
        GroupConditionList: groupListArr
      }
      this.api.updateMarketingCareCampaignGroupConditions(groupObj).subscribe((res) => {

        if (res && res.data == '1') {
          this.toastr.successToastr('Group has been updated successfully.', '', true);
          this.goBack();
        }
        else {
          this.isSpinner = false;
          this.toastr.errorToastr(res.message, '', true);
  
        }
      })
    }
  }


  submit() {
    this.formSubmited = true
    if (this.groupUpdateData) {
      this.updateGroup();
    } else {
      this.createGroup();
    }
  }

  getGroupFields(): FormGroup {
    return new FormGroup({
      entity: new FormControl('', Validators.required),
      conditionOperator: new FormControl('', Validators.required),
      operator: new FormControl(''),
      value: new FormControl('', Validators.required)
    })
  }

  validateOperator() {
    return this.createGroupForm.get('operator').invalid
  }

  groupListArray() {
    return this.createGroupForm?.get('groupList') as FormArray;
  }

  addGroup(index: number) {
    this.groupListArray().push(this.getGroupFields());
    this.handleOperatorValidation();
    this.cdRef.detectChanges();
  }

  handleOperatorValidation() {
    this.groupListArray().controls.forEach((res, i) => {
      if (this.isOperatorVisible(i)) {
        res.get('operator').setValidators(Validators.required)
        res.updateValueAndValidity()
      } else {
        res.get('operator').clearValidators()
        res.get('operator').updateValueAndValidity()
        res.get('operator').patchValue('')

      }
    })
  }

  removeGroup(i: number) {
    this.groupListArray().removeAt(i)
    if (this.patchValuesForConditions) {
      if (this.patchValuesForConditions.groupList[i]) {
        this.patchValuesForConditions.groupList.splice(i, 1)

      }
    }
    this.handleOperatorValidation()
  }

  getFormArrayStatus(index: number, formField: string) {
    return this.groupListArray().controls[index].get(formField)
  }

  getFormGroup() {
    return this.createGroupForm.get('groupName')
  }

  goBack() {
    if (this.sourcePage === 'schedule') {
      this.router.navigate(['marketingcare/create-schedule']);
    } else {
      this.router.navigate(['marketingcare/groups']);
    }
  }
  isOperatorVisible(index: number) {
    return !(index == this.groupListArray().controls.length - 1)
  }

  addItem(event: any) {
    const abc = this.createGroupForm.get('groupList') as FormArray
    abc.at(event.index).patchValue(event.values)
  }

}

