import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentAllocationLookup } from '../../../models/allocation-lookup';
import { AllocationLookupService } from '../../../services/allocation-lookup.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-auto-allocation-unallocated-payments',
  templateUrl: './auto-allocation-unallocated-payments.component.html',
  styleUrls: ['./auto-allocation-unallocated-payments.component.css']
})
export class AutoAllocationUnallocatedPaymentsComponent implements OnInit {

  formGroup: UntypedFormGroup;

  backLink = '/fincare/billing-manager';
  requiredPermission = 'Manual Payment Allocation';
  claimRecoveryAllocationPermission = 'Claim Recovery Payment Allocation';
  hasclaimRecoveryAllocationPermission: boolean;
  hasPermission: boolean;
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  debtorSearchResult: DebtorSearchResult;
  rolePlayerId: number;
  isRefreshing: boolean;
  allocationLookupList: PaymentAllocationLookup[] = [];
  debtorNumber: string;

  isDebtorSelected: boolean;

  shouldLoadAllReferences: boolean;

  currentQuery: any;
  
  message: string;

  submitDisabled = true;

  allocationLookupDataSource = new MatTableDataSource<PaymentAllocationLookup>();
  displayedAllocationLookupColumns = ['debtorNumber', 'userReference', 'actions'];
  config: any;
  minAmountAllowed = 1;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formbuilder: UntypedFormBuilder,
    private readonly allocationLookupService: AllocationLookupService,
    private readonly invoiceService: InvoiceService,
    private readonly authService: AuthService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.hasclaimRecoveryAllocationPermission = userUtility.hasPermission(this.claimRecoveryAllocationPermission);
      this.hasPermission = userUtility.hasPermission(this.requiredPermission);
  
      if (this.hasPermission || this.hasclaimRecoveryAllocationPermission) {
        this.createForm();
      }
    });

    const debtorNumber = this.formGroup.get('debtorNumber');
    this.shouldLoadAllReferences = true;
    
    debtorNumber.valueChanges.pipe(debounceTime(0.5),
      switchMap(changedValue => this.invoiceService.searchDebtors(changedValue)))
      .subscribe(result => {
        this.debtorNumber = result[0].finPayeNumber;
      
        this.isDebtorSelected = true;
        this.shouldLoadAllReferences = false;

        this.allocationLookupService.getAllocationLookupsByDebtorNumber(this.debtorNumber)
        .subscribe(existingReferences => {
          if(existingReferences.length > 0) {
            this.allocationLookupDataSource.data = existingReferences;
            
            this.isSubmitting$.next(false);
          }
        });
      },
    error => {
      this.toastr.errorToastr('Error with searching a debtor: ' + error);
    });
  }

  createForm() {
    this.formGroup = this.formbuilder.group({
      userReference: '',
      debtorNumber: ''
    });
  }

  addToList() {
    let allocationLookup = new PaymentAllocationLookup();
    
    allocationLookup.debtorNumber = this.debtorNumber;
    allocationLookup.userReference = this.formGroup.get('userReference').value;
    allocationLookup.createdBy = this.authService.getUserEmail();
    allocationLookup.modifiedBy = this.authService.getUserEmail();

    if(allocationLookup.userReference === '' || allocationLookup.userReference == undefined) {
      this.toastr.errorToastr('Reference number is required.', 'Reference Number');
      return;
    }

    let hasDuplicate = this.allocationLookupDataSource.data.filter(x =>
        x.debtorNumber === allocationLookup.debtorNumber
        && x.userReference === allocationLookup.userReference).length > 0;
    
    if (hasDuplicate) {
      this.toastr.errorToastr('Duplicate item detected for reference: ' + allocationLookup.userReference, 'Duplicate Item');
      return;
    }

    if (allocationLookup.debtorNumber !== '' && allocationLookup.userReference !== '') {
      this.submitDisabled = false;
      
      let oldList = this.allocationLookupDataSource.data;
      oldList.push(allocationLookup);

      this.allocationLookupDataSource.data = oldList;
    }
  }

  removeRow(userReference: string) {
    let oldList = this.allocationLookupDataSource.data;
    oldList = oldList.filter(x => x.userReference !== userReference);

    this.allocationLookupDataSource.data = oldList;
    this.allocationLookupList = oldList;

    this.submitDisabled = true;
  }

  delete(id: number, userReference: string) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Delete Reference: ${userReference}?`,
        text: 'Are you sure you want to proceed with a delete?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.allocationLookupService.deleteAllocationLookup(id).subscribe(result => {
          if(result) {
            let oldList = this.allocationLookupDataSource.data;
            oldList = oldList.filter(x => x.id !== id);
    
            this.allocationLookupDataSource.data = oldList;
            this.allocationLookupList = oldList;
            
            let newItem = oldList.filter(x => x.id == undefined);
            if (newItem && newItem.length === 0) {
              this.submitDisabled = true;
            }
          }
        },
        error => {
          this.toastr.errorToastr('Failed to delete the reference with id: ' + id);
        });
      }
    });
  }

  saveAllocationLookups() {
    this.isSubmitting$.next(true);
    
    if(this.allocationLookupDataSource.data.length > 0) {
      let newList = this.allocationLookupDataSource.data.filter(x => x.id == undefined || x.id === 0);
      
      this.allocationLookupService.createAllocationLookups(newList).subscribe(
        (data: number) => {
          this.toastr.successToastr('Successfully saved all allocation lookup items', 'Save and Allocate');
          this.allocationLookupList = [];
          this.allocationLookupDataSource.data = this.allocationLookupList;
          this.isSubmitting$.next(false);
          
          this.submitDisabled = true;
        
          this.formGroup.reset(); // Clears the form fields and validation
        },
        (httpResponse: HttpErrorResponse) => {
          const message = (httpResponse.error && httpResponse.error.Error) ? httpResponse.error.Error : httpResponse.message;
          this.toastr.errorToastr('Failed to save allocation lookup items: ' + message, 'Save and Allocate')
        
          this.isSubmitting$.next(false);
          this.submitDisabled = false;
        }
      );
    }
  }
 
  onDebtorSelected(debtorSearchResult: DebtorSearchResult) {
    this.debtorSearchResult = debtorSearchResult;
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.debtorNumber = debtorSearchResult.finPayeNumber;
    this.isRefreshing = false;

    if (this.rolePlayerId > 0) {
      this.formGroup.get('debtorNumber').setValue(this.debtorNumber);
    
      this.isDebtorSelected = true;
    }
    else {
      this.toastr.infoToastr('Cannot find a debtor');
    }
  }
  
  onTabActivated($event) {
    if ($event.index == 1) {
      this.shouldLoadAllReferences = true;
    }
  }

  sort: MatSort;
  paginator: MatPaginator;

  disableFormControl(controlName: string) {
    this.formGroup.get(controlName).disable();
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.formGroup.get(controlName).setValidators([validationToApply]);
    this.formGroup.get(controlName).markAsTouched();
    this.formGroup.get(controlName).updateValueAndValidity();
  }
}