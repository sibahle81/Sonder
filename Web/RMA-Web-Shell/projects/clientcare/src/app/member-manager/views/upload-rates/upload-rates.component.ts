import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import * as XLSX from 'xlsx';
import { MemberService } from '../../services/member.service';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-upload-rates',
  templateUrl: './upload-rates.component.html',
  styleUrls: ['./upload-rates.component.css']
})
export class UploadRatesComponent implements OnInit, AfterViewInit {

  form: UntypedFormGroup;

  @ViewChild('uploadControl', { static: false }) uploadControlComponent: UploadControlComponent;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  message: string;
  originalMessage = 'Uploading large files may take several minutes...';
  contentMessage = 'File does not have any contents, please load another document';
  validationErrorMessage = 'File was not uploaded. Please correct the below validation errors and try again';

  hasList: boolean;
  currentUser: User;

  errors: any[] = [];
  selectedUploadType: any;

  // public uploadTypes = [
  //   'Industry Rates',
  //   'Member Rates',
  // ];

  public uploadTypes = [
    'Industry Rates'
  ];

  fileIdentifier: string;
  hasUploadRatesPermission = false;

  constructor(
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    public memberService: MemberService,
    private formBuilder: UntypedFormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkPermissions();
    this.createForm();
    this.message = this.originalMessage;
  }

  checkPermissions() {
    this.hasUploadRatesPermission = userUtility.hasPermission('Upload Rates File');
  }

  ngAfterViewInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.changeDetectorRef.detectChanges();
  }

  createForm() {
    this.form = this.formBuilder.group({
      uploadType: [null]
    });
  }

  uploadTypeChanged(event: any) {
    this.fileIdentifier = null;
    this.selectedUploadType = event.value;
    this.uploadControlComponent.resetUpload();
    this.message = this.originalMessage;
  }

  getButtonColor(listLength: any) {
    if (listLength > 0) {
      this.hasList = true;
      return '#51627c';
    } else {
      this.hasList = false;
      return 'lightgrey';
    }
  }

  save(): void {
    this.isLoading$.next(true);
    const uploadType = this.selectedUploadType;

    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) {
      this.isLoading$.next(true);
      return;
    }

    const total = files.length;
    let idx = 0;

    for (const file of files) {
      file.isLoading = true;
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        let fileData = reader.result as string;
        const identifier = 'base64,';
        const index = fileData.indexOf(identifier);
        if (index >= 0) {
          fileData = fileData.substr(index + identifier.length);
          const binaryString: string = atob(fileData);

          const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
          const worksheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];

          let csvData = XLSX.utils.sheet_to_csv(worksheet);
          csvData = this.parseCsvFile(csvData, uploadType);
          if (!csvData) {
            this.message = this.contentMessage;
            this.hasList = false;
            this.reset();
            this.isLoading$.next(false);
          } else {
            this.message = this.originalMessage;
            const content = { data: btoa(unescape(encodeURIComponent(csvData))), fileName: file.name, userId: this.currentUser.id };

            if (this.selectedUploadType === 'Member Rates') {
              this.memberService.uploadMemberRates(content).subscribe(data => {
                if (data.validationCount > 0) {
                  this.SetFileIdentifier(data.fileIdentifier);
                }
                else {
                  var skipped;
                  if (data.totalSkipped > 0) {
                    skipped = `, ${data.totalSkipped} skipped`;
                  }
                  else {
                    skipped = `, 0 skipped`;
                  }
                  this.alertService.success('Rates uploaded successfully', 'Upload Successful');
                  this.message = `${data.total} records uploaded from ${file.name} ${skipped}`
                  this.uploadControlComponent.delete(file);
                }

                idx++;
                if (idx >= total) {
                  this.reset();
                  this.isLoading$.next(false);
                }
              },
                errorResponse => {
                  this.message = errorResponse;
                  this.reset();
                  this.isLoading$.next(false);
                });
            } else {
              this.memberService.uploadIndustryRates(content).subscribe(data => {
                if (data.validationCount > 0) {
                  this.SetFileIdentifier(data.fileIdentifier);
                }
                else {
                  var skipped;
                  if (data.totalSkipped > 0) {
                    skipped = `, ${data.totalSkipped} skipped`;
                  }
                  else {
                    skipped = `, 0 skipped`;
                  }
                  this.alertService.success('Rates uploaded successfully', 'Upload Successful');
                  this.message = `${data.total} records uploaded from ${file.name} ${skipped}`
                  this.uploadControlComponent.delete(file);
                }

                idx++;
                if (idx >= total) {
                  this.reset();
                  this.isLoading$.next(false);
                }
              },
                errorResponse => {
                  this.message = errorResponse;
                  this.reset();
                  this.isLoading$.next(false);
                });
            }
          }
        }
      };
      reader.readAsDataURL(file.file);
    }
  }

  SetFileIdentifier(fileIdentifier: string) {
    this.fileIdentifier = fileIdentifier;
  }

  hasValidationErrors($event: boolean) {
    if ($event) {
      this.selectedUploadType = null;
      this.message = this.validationErrorMessage;
      this.uploadControlComponent.resetUpload();
      this.form.controls.uploadType.reset();
    }
  }

  reset() {
    this.selectedUploadType = null;
    this.uploadControlComponent.resetUpload();
    this.form.controls.uploadType.reset();
  }

  parseCsvFile(csvData: string, uploadType: string): string {
    let identifier = 'MemberNo,';

    if (uploadType === 'Industry Rates') {
      identifier = 'Industry';
    }

    const index = csvData.indexOf(identifier);

    if (index >= 0) {
      const result: string = csvData.substr(index);
      return result;
    }

    return '';
  }
}
