import { Component, OnChanges, Input, Output, EventEmitter, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ssrs-reportviewer',
  templateUrl: './reportviewer.component.html',
  styleUrls: ['./reportviewer.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ReportViewerComponent implements OnChanges {
  @Input() reporturl: string;
  @Input() reportserver: string;
  @Input() showparameters = 'false';
  @Input() parameters?: any;
  @Input() language = 'en-us';
  @Input() width = 100;
  @Input() height = 100;
  @Input() toolbar = 'true';
  @Input() format = 'PDF';
  @Input() extension = 'PDF';
  @Input() isDownload = 'false';
  @Input() reportName = 'report';
  @Input() useCustomParameters = false;

  @Output() error = new EventEmitter<any>();
  @Output() downloadComplete = new EventEmitter<boolean>();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private sanitizer: DomSanitizer, private httpClient: HttpClient, private authService: AuthService, public datepipe: DatePipe) { }

  source: SafeResourceUrl;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.reporturl) {
      this.error.emit('Src cannot be null');
      return;
    }

    if ('reporturl' in changes || 'parameters' in changes || 'format' in changes) {
      const token = this.authService.getCurrentToken();
      if (token != null) {
        this.generateReport(token);
      }
    }
  }

  public buildParameterString(): string {

    let parameterString = '';

    if (this.useCustomParameters) {
      return this.parameters;
    }

    for (const param in this.parameters) {
      if (param) {
        if (this.parameters[param] instanceof Array === true) {
          for (const arrayParam in this.parameters[param]) {
            if (arrayParam) {
              parameterString += '&' + param + '=' + this.parameters[param][arrayParam];
            }
          }
        }
        if (this.parameters[param] != null && this.parameters[param] instanceof Array === false) {
          parameterString += '&' + param + '=' + this.parameters[param];
        }
        if (this.parameters[param] == null) {
          parameterString += '&' + param + ':isnull=true';
        }
      }
    }
    return parameterString;
  }

  public buildReportUrl(): string {
    if (!this.reporturl) {
      return;
    }
    const parameters = this.buildParameterString();

    return this.reportserver
      + this.reporturl
      + '&rs:Format='
      + this.format
      + '&rc:Parameters='
      + this.showparameters
      + parameters
      + '&rs:ParameterLanguage='
      + this.language
      + '&rc:Toolbar=' + this.toolbar
      + '&rs:Command=ClearSession'
      + '&rc:Command=Render';
  }

  generateReport(bearerToken: string) {
    this.isLoading$.next(true);

    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + bearerToken);
    headers = headers.append('Access-Control-Allow-Credentials', 'true');
    headers = headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, POST, DELETE, OPTIONS');
    headers = headers.append('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token, Access-Token');

    const reportUrl = this.buildReportUrl();

    const date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');

    this.httpClient.get<Blob>(reportUrl, { headers, responseType: 'blob' as any, withCredentials: true }).subscribe(result => {
      if (this.format.toLowerCase() === 'csv') {
        this.downloadFile(result, this.reportName + '-(' + date + ').csv', 'text/csv');
      } else if (this.format.toLowerCase() === 'excel') {
        this.downloadFile(result, this.reportName + '-' + date + '.xls', 'application/vnd.ms-excel');
      } else if (this.format.toLowerCase() === 'pdf' && this.isDownload.toLowerCase() === 'true') {
        this.downloadFile(result, this.reportName + '-' + date + '.pdf', 'application/pdf');
      } else {
        this.source = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(result));
      }
      this.isLoading$.next(false);
    }, error => {
      this.error.emit(error);
      this.isLoading$.next(false);
    });
  }

  downloadFile(data: any, fileName: string, mimeType: string) {
    const blob = new Blob([data], { type: mimeType });
    if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE
      window.navigator.msSaveOrOpenBlob(blob, fileName);
      this.downloadComplete.emit(true);
    } else { // Chrome & Firefox
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      this.downloadComplete.emit(true);
    }
  }
}
