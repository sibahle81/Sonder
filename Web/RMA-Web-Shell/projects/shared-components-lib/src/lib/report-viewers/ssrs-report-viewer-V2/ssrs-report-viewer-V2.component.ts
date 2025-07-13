import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Component, OnChanges, Input, SimpleChanges, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { DatePipe, KeyValue } from '@angular/common';
import { AuthTokenModel } from 'projects/shared-models-lib/src/lib/security/auth-tokens-model';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ssrs-report-viewer-V2',
  templateUrl: './ssrs-report-viewer-V2.component.html',
  styleUrls: ['./ssrs-report-viewer-V2.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class SSRSReportViewerV2Component implements OnChanges {
  // Required
  @Input() reporturl: string;
  @Input() parameters: KeyValue<string, string>[];

  // Optional
  @Input() reportName = 'download';
  @Input() isWizard: boolean;
  @Input() triggerRefresh: boolean;

  @Output() viewedCompletedEmit: EventEmitter<boolean> = new EventEmitter(false);
  @Output() downloadCompletedEmit: EventEmitter<boolean> = new EventEmitter(false);

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  isIE = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
  hasError: boolean;

  tokens: AuthTokenModel;
  source: SafeResourceUrl;
  ssrsBaseUrl: string;
  format = 'PDF';

  constructor(
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private authService: AuthService,
    public datepipe: DatePipe,
    private lookupService: LookupService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.reporturl && this.parameters) {
      this.isLoading$.next(true);
      this.loadingMessage$.next('loading report...please wait');
      this.getLookups();
    }
  }

  getLookups() {
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(result => {
      this.ssrsBaseUrl = result;

      this.tokens = this.authService.getCurrentTokens();
      if (this.tokens != null) {

        if (this.isWizard) {
          setTimeout(() => {
            this.generateReport(false, this.format);
          }, 1500);
        } else {
          this.generateReport(false, this.format);
        }
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  public buildParameterString(): string {
    let parameterString = '';

    this.parameters.forEach(parameter => {
      if (!(parameter.value === 'all')) {
        parameterString += '&' + parameter.key + '=' + parameter.value;
      }
    });

    return parameterString;
  }

  public buildReportUrl(): string {
    const parameters = this.buildParameterString();

    if(this.isWizard) {
      return this.ssrsBaseUrl
      + this.reporturl
      + '&rs:Command=Render'
      + '&rs:ClearSession=true'
      + '&rc:Toolbar=false'
      + '&rs:Format='
      + this.format
      + '&rc:Parameters=false'
      + parameters
      + '&rs:ParameterLanguage=en-us'
      + '&rv:ToolBarItemsDisplayMode=0x3F';
    } else {
      return this.ssrsBaseUrl
      + this.reporturl
      + '&rs:Command=Render'
      + '&rs:ClearSession=true'
      + '&rc:Toolbar=true'
      + '&rs:Format='
      + this.format
      + '&rc:Parameters=false'
      + parameters
      + '&rs:ParameterLanguage=en-us';
    }
  }

  generateReport(isDownload: boolean, format: string) {
    this.isLoading$.next(true);
    this.hasError = false;
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.tokens.access_token);
    headers = headers.append('Access-Control-Allow-Credentials', 'true');
    headers = headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS');
    headers = headers.append('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token, Access-Token');

    this.format = isDownload ? format : 'PDF';

    const reportUrl = this.buildReportUrl();

    this.httpClient.get<Blob>(reportUrl, { headers, responseType: 'blob' as any, withCredentials: true }).subscribe(result => {
      if (!isDownload) {
        this.source = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(result));
        this.viewedCompletedEmit.emit(true);
        this.isLoading$.next(false);
      }

      if (isDownload) {
        const date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');

        if (format.toLowerCase() === 'csv') {
          this.downloadFile(result, this.reportName + '(' + date + ').csv', 'text/csv');
        } else if (format.toLowerCase() === 'excel') {
          this.downloadFile(result, this.reportName + ' ' + date + '.xls', 'application/vnd.ms-excel');
        } else if ((format.toLowerCase() === 'pdf') || (this.isIE)) {
          this.downloadFile(result, this.reportName + ' ' + date + '.pdf', 'application/pdf');
        }
      }
    }, error => {
      this.hasError = true;
      this.isLoading$.next(false);
    });
  }


  downloadFile(data: any, fileName: string, mimeType: string) {
    const blob = new Blob([data], { type: mimeType });
    if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else { // Chrome & Firefox
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
    this.downloadCompletedEmit.emit(true);
    this.isLoading$.next(false);
  }
}
