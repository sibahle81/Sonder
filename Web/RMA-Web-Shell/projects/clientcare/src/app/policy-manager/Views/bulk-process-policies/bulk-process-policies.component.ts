import { OnInit, ViewChild, Directive } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import 'src/app/shared/extensions/date.extensions';

import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Directive()
export abstract class BulkProcessPoliciesComponent implements OnInit {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  message: BehaviorSubject<string> = new BehaviorSubject<string>('');
  policies: string[] = [];
  errors: string[] = [];
  disabled = false;
  title = '';

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  constructor(
    protected readonly alertService: AlertService,
    protected readonly datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.subscribeUploadChanged();
  }

  subscribeUploadChanged(): void {
    this.disabled = true;
    this.uploadControlComponent.uploadChanged.subscribe(
      data => {
        this.disabled = false;
      }
    );
  }

  save(): void {
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }

    this.uploadControlComponent.isUploading = true;
    const fileCount = files.length;
    const identifier = 'base64,';
    let filesLoaded = 0;

    this.policies = [];
    this.errors = [];

    this.message.next('Reading file contents...');

    for (const file of files) {
      file.isLoading = true;
      const reader = new FileReader();
      reader.onload = (event: Event) => {
        let data = reader.result as string;
        const index = data.indexOf(identifier);
        if (index >= 0) {
          data = data.substr(index + identifier.length);
          const content: string = atob(data);
          const lines = content.split('\n');
          for (let line of lines) {
            line = line.trim();
            if (!line.startsWith('Policy')) {
              this.policies.push(line);
            }
          }
        }
      };
      reader.onloadend = (event: Event) => {
        filesLoaded++;
        if (filesLoaded >= fileCount) {
          this.processPolicies();
        }
      };
      reader.readAsDataURL(file.file);
    }
  }

  abstract processPolicies();

  protected loadPolicyFileContent(): any[] {
    const result = [];
    if (this.policies.length === 0) { return result; }
    for (const line of this.policies) {
      const values = line.split(',');
      if (values.length >= 2 && values[0].toLowerCase().search('policy') === -1) {
        const policyNumber = values[0];
        const effectiveDateString = values[1];
        if (!String.isNullOrEmpty(policyNumber)) {
          if (!String.isNullOrEmpty(effectiveDateString)) {
            const effectiveDate = new Date(effectiveDateString);
            if (effectiveDate) {
              result.push([policyNumber, effectiveDate]);
            }
          }
        }
      }
    }
    return result;
  }
}
