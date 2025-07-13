import { Component, ViewChild, OnInit } from '@angular/core';

import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AgeAnalysisService } from '../../../shared/services/age-analysis.service';
import { ToastrManager } from 'ng6-toastr-notifications';


@Component({
  templateUrl: './upload-collection-agents.component.html'
})
export class UploadCollectionAgentsComponent implements OnInit {

  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;

  disabled = false;

  constructor(
    private readonly alertService: AlertService,
    private readonly importService: AgeAnalysisService,
    private readonly toastr: ToastrManager
  ) { }

  ngOnInit(): void {
    this.subscribeUploadChanged();
  }

  subscribeUploadChanged(): void {
    this.uploadControlComponent.uploadChanged.subscribe(
      data => {
        if (data) {
          this.disabled = false;
        } else {
          this.disabled = false;
        }
      }
    );
  }

  save(): void {
    const files = this.uploadControlComponent.getUploadedFiles();
    if (files.length === 0) { return; }

    this.uploadControlComponent.isUploading = true;
    const total = files.length;
    let idx = 0;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = this.getDataContent(reader.result.toString());
        const dataContent = { data: content };
        this.importService.importCollectionAgents(dataContent).subscribe(
          data => {
            this.toastr.successToastr(`${data} records updated from ${file.name}`, 'Upload File');
            this.uploadControlComponent.delete(file);
            idx++;
            if (idx >= total) {
              this.uploadControlComponent.isUploading = false;
            }
          }
        );
      };
      reader.readAsText(file.file);
    }
  }

  getDataContent(content: string): string {
    const columnIndex = { accountId: 0, collectionAgent: 1, debtorsClerk: 2 };
    const data = content.split('\r');
    let result = 'AccountId,CollectionAgent,DebtorsClerk\r\n';

    for (let line of data) {
      line = line.trim();
      if (line !== '') {
        const value = this.parseLine(columnIndex, line);
        if (value !== '') {
          result += `${value}\r\n`;
        }
      }
    }

    return result;
  }

  parseLine(columns: any, line: string): string {


    // const data = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    const data = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    // tslint:disable-next-line:no-string-literal
    const collectionAgent = data[columns['collectionAgent']] ? data[columns['collectionAgent']] : '';
    // tslint:disable-next-line:no-string-literal
    const debtorsClerk = data[columns['debtorsClerk']] ? data[columns['debtorsClerk']] : '';
    if (collectionAgent === '' && debtorsClerk === '') {
      return '';
    }
    // tslint:disable-next-line:no-string-literal
    const result = `${data[columns['accountId']]},${collectionAgent},${debtorsClerk}`;
    return result;
  }
}
