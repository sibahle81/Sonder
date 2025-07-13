import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { BehaviorSubject } from 'rxjs';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PaymentService } from '../../services/payment.service';
import * as XLSX from 'xlsx';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-upload-hcp-discounts',
  templateUrl: './upload-hcp-discounts.component.html',
  styleUrls: ['./upload-hcp-discounts.component.css']
})
export class UploadHcpDiscountsComponent implements OnInit, AfterViewInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @ViewChild('uploadControl') uploadControlComponent: UploadControlComponent;

  hasList = false;
  public baseUrl: any;
  isFileSelected = false;
  isUploading = false;
  title = 'Please Upload Document for HCP Discounts';
  public currentUser: User;
  strFileName:string;
  constructor(
    private readonly router: Router,
    public readonly dialog: MatDialog,
    public readonly lookupService: LookupService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    private readonly policyService: PolicyService) { }


  ngAfterViewInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.uploadControlComponent) {
      if (this.uploadControlComponent.uploadFileList.length > 0) {
        this.hasList = true;
      }
    }
  }

  ngOnInit(): void {
    this.getBaseUrl();
  }

  save(): void {
    
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }
    this.isSubmitting$.next(true);
    this.isUploading = true;
    this.uploadControlComponent.isUploading = true;
    const total = files.length;
    let idx = 0;
    
    for (const file of files) {
      
      file.isLoading = true;
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        const fileContent = <string>reader.result;
        const identifier = 'base64,';
        const index = fileContent.indexOf(identifier);
        if (index >= 0) {
          let premiumListingData = fileContent.substring(index + identifier.length);
          const binaryString: string = atob(premiumListingData);
          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary', dateNF: 'FMT1' });
          /* selected the first sheet */
          var len = workbook.SheetNames.length;
          const woorksheetName: string = workbook.SheetNames[1];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[woorksheetName];
          const csvData = this.parseCsvFile(XLSX.utils.sheet_to_csv(worksheet));
          const data = encodeURIComponent(csvData);
          const content = { data: btoa(unescape(data)) };
          this.policyService.uploadDiscountListing(file.name, content).subscribe({
            next: (data: string[]) => {
              if (data.length > 0) {
                this.alertService.error(`Upload of ${file.name} failed`, 'File Upload Error');
                for (const msg of data) {
                  //this.errorMessage.push(msg);
                }
                idx++;
              } else {
                this.alertService.success(`${file.name} successfully uploaded`, 'Discount File');
                this.uploadControlComponent.delete(file);
                idx++;
                this.isSubmitting$.next(false);
              }
              if (idx >= total) {
                this.uploadControlComponent.isUploading = false;
              }
            },
            error: (errorResponse: HttpErrorResponse) => {
              this.alertService.error('File Upload Error', 'Discount File Error');
              this.uploadControlComponent.isUploading = false;
              this.isSubmitting$.next(false);
            }
          });
        }
      };

      reader.readAsDataURL(file.file);
    
  
}
}

  parseCsvFile(csvData: string): string {
    const identifier = 'LOCATION_DESC,';
    const index = csvData.indexOf(identifier);
    if (index >= 0) {
      const result: string = csvData.substr(index);
      return result;
    }
    return '';
  }

  back() {
    this.router.navigateByUrl('/fincare/payment-manager');
  }

  openExceptionReportDialog(isViewExceptionReport: boolean, fileIdentifier: any): void {
    //TO-DO Exception report - Gram
    // const dialog = this.dialog.open(BrokerExceptionReportComponent, {
    //   width: '1200px',
    //   height: 'auto',
    //   data: { fileIdentifier, isViewExceptionReport, BaseUrl: this.baseUrl }
    // });
    // dialog.afterClosed().subscribe(result => {
    //   this.isLoading$.next(true);
    //   if (result) {

    //   } else { this.isLoading$.next(false); }
    // });
  }

  getBaseUrl() {
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.baseUrl = value;
    });
  }

  fileSelected($event) {
    this.isFileSelected = $event;
    this.uploadControlComponent.uploadFileList.forEach(file => {
    this.strFileName = file.name;
    this.isFileSelected = true;
    //TO-DO : File check
    // this.paymentService.getDiscountFileAudits().subscribe(filesUploaded=>{
    //   var file = filesUploaded.filter(x=>x.fileName == this.strFileName && (x.discountFileStatus == DiscountFileStatusEnum.Uploaded));
    //   if(file.length > 0){
    //     this.alertService.error(`${file[0].fileName} file is already uploaded`, 'HCP Discount File');
    //     this.isFileSelected = false;
    //   }else{
    //     this.isFileSelected = true;
    //   }
    // })
    // });
    
    })
  }

}
