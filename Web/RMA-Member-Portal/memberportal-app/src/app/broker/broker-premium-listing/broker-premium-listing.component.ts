import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UploadControlComponent } from 'src/app/shared/components/upload-control/upload-control.component';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LookupService } from 'src/app/shared/services/lookup.service';
import * as XLSX from 'xlsx';
import { BrokerExceptionReportComponent } from '../broker-exception-report/broker-exception-report.component';
import { PremiumListingFileAuditComponent } from '../premium-listing-file-audit/premium-listing-file-audit.component';
import { BrokerPolicyService } from '../services/broker-policy-service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PremiumListingStatusEnum } from 'src/app/shared/enums/premium-listing-status.enum';
import { UserDetails } from 'src/app/core/models/security/user-details.model';

@Component({
  selector: 'broker-premium-listing',
  templateUrl: './broker-premium-listing.component.html',
  styleUrls: ['./broker-premium-listing.component.scss']
})
export class BrokerPremiumListingComponent implements OnInit, AfterViewInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @ViewChild('uploadControl') uploadControlComponent: UploadControlComponent;
  @ViewChild('premiumListingFileAudit') premiumListingFileAuditComponent: PremiumListingFileAuditComponent;

  hasList = false;
  public baseUrl: any;
  isFileSelected = false;
  isUploading = false;
  title = ConstantPlaceholder.PremiumListingTitle;
  public currentUser: UserDetails;
  strFileName:string;
  constructor(
    private readonly router: Router,
    public readonly dialog: MatDialog,
    public readonly lookupService: LookupService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    private readonly policyService: BrokerPolicyService) { }


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
    this.isUploading = true;
    this.uploadControlComponent.isUploading = true;
    const total = files.length;
    let idx = 0;
    
    for (const file of files) {
      
      file.isLoading = true;
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        let premiumListingData = reader.result as string;
        const identifier = 'base64,';
        const index = premiumListingData.indexOf(identifier);
        if (index >= 0) {
          premiumListingData = premiumListingData.substr(index + identifier.length);
          const binaryString: string = atob(premiumListingData);
          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
          /* selected the first sheet */
          const woorksheetName: string = workbook.SheetNames[0];
          const worksheet: XLSX.WorkSheet = workbook.Sheets[woorksheetName];
          let csvData = XLSX.utils.sheet_to_csv(worksheet);
          csvData = this.parseCsvFile(csvData);
          const content = { data: btoa(unescape(encodeURIComponent(csvData))), fileName: file.name, userId: this.authService.getCurrentUser().id};
          this.policyService.brokerUploadPremiumListing(content).subscribe(
            data => {
              if (data > 0) {
                this.alertService.success(`${data} members uploaded from ${file.name}`, 'Premium Listing');
                this.uploadControlComponent.delete(file);
                this.premiumListingFileAuditComponent.getData();
              } else {
                this.alertService.error('File not uploaded, see error log');
                this.uploadControlComponent.delete(file);
                this.premiumListingFileAuditComponent.getData();
              }
              idx++;
              if (idx >= total) {
                this.uploadControlComponent.isUploading = false;
                this.isUploading = false;
                this.isFileSelected = false;
              }
            },
            errorResponse => {
              this.alertService.parseError(errorResponse, 'Premium Listing Error');
              this.uploadControlComponent.isUploading = false;
              this.isUploading = false;
              this.isFileSelected = false;
            }
          );
        }
      };

      reader.readAsDataURL(file.file);
    
  
}
}

  parseCsvFile(csvData: string): string {
    const identifier = 'Company,';
    const index = csvData.indexOf(identifier);
    if (index >= 0) {
      const result: string = csvData.substr(index);
      return result;
    }
    return '';
  }

  back() {
    this.router.navigateByUrl('broker-policy-list');
  }

  openExceptionReportDialog(isViewExceptionReport: boolean, fileIdentifier: any): void {
    const dialog = this.dialog.open(BrokerExceptionReportComponent, {
      width: '1200px',
      height: 'auto',
      data: { fileIdentifier, isViewExceptionReport, BaseUrl: this.baseUrl }
    });
    dialog.afterClosed().subscribe(result => {
      this.isLoading$.next(true);
      if (result) {

      } else { this.isLoading$.next(false); }
    });
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
    this.policyService.GetPremiumListingFileAuditsByBrokerEmail(this.currentUser.email).subscribe(filesUploaded=>{
      var file = filesUploaded.filter(x=>x.fileName == this.strFileName && ((x.premiumListingStatus == PremiumListingStatusEnum.Uploaded) || (x.premiumListingStatus == PremiumListingStatusEnum.Approved) || (x.premiumListingStatus == PremiumListingStatusEnum.AwaitingApproval)));
      console.log(file);
      if(file.length > 0){
        this.alertService.error(`${file[0].fileName} file is already uploaded`, 'Premium Listing');
        this.isFileSelected = false;
      }else{
        this.isFileSelected = true;
      }
    })
    });
    
  }
}
