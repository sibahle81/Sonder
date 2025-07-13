import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { DownloadRequest } from 'src/app/shared/models/download-request.model';
import { ValidationResultModel } from 'src/app/shared/models/validations-result.model';
import { RolePlayerRelation } from 'src/app/shared/models/roleplayer-relation';

/** @description Common functions for angular services. */
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private baseUrl = '';

  constructor(
    private http: HttpClient,
    private readonly authService: AuthService) {
    const singleSignOnIssuerAuthority = authService.getSingleSignOnIssuerAuthority();
    if (singleSignOnIssuerAuthority === '') {
      this.baseUrl = window.location.protocol + '//' + window.location.host;
    } else {
      this.baseUrl = `${singleSignOnIssuerAuthority}`;
    }
  }

  // /**
  //  * @description Combines the controller name to set the api url to user.
  //  * @param string controller The name of the controller.
  //  */
  getApiUrl(controller: string): string {
    return `${this.baseUrl}/api/${controller}`;
  }

  /** @description Adds the default request headers that is needed when making an api call. */
  getApiRequestOptions(): object {
    const token = this.authService.getCurrentToken();
    if (token) {
      return {
        headers: new HttpHeaders(
          {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: 'Bearer ' + token
          }
        )
      }
    } else {
      return {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8'
        })
      };
    }
  }

  getApiRequestOptionsAuthTextResponseType(): object {
    const token = this.authService.getCurrentToken();
    if (token) {
      return {
        headers: new HttpHeaders(
          { Authorization: 'Bearer ' + token }
        ),
        responseType: 'text'
      }
    } else {
      return { headers: new HttpHeaders({}) };
    }
  }

  getApiRequestOptionsAuthOnly(): object {
    const token = this.authService.getCurrentToken();
    if (token) {
      return {
        headers: new HttpHeaders(
          { Authorization: 'Bearer ' + token }
        )
      }
    } else {
      return {
        headers: new HttpHeaders({
        })
      };
    }
  }

  getUnAuth<T>(id: any, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}/${id}`;
    const headers = this.getApiRequestOptions();

    return this.http.get<T>(apiUrl);
  }

  get<T>(item: any, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}/${item}`;
    const headers = this.getApiRequestOptions();
    return this.http.get<T>(apiUrl, headers);
  }

  getByIds<T>(id: any, id2: number, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}/${id}/${id2}`;
    const headers = this.getApiRequestOptions();
    return this.http.get<T>(apiUrl, headers);
  }

  getBy<T>(id: any, keys: any, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}/${id}/${keys}`;
    const headers = this.getApiRequestOptions();
    return this.http.get<T>(apiUrl, headers);
  }

  getAll<T>(apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.get<T>(apiUrl, headers);
  }

  postRelation<T>(apiUrl: string, object: RolePlayerRelation): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.post<T>(apiUrl, JSON.stringify(object), headers);
  }

  addToReturnNumberArray<T>(item: T, apiUrl: string): Observable<number[]> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<number[]>(apiUrl, JSON.stringify(item), headers);
  }

  addToReturnString<T>(item: T, apiUrl: string): Observable<string> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<string>(apiUrl, JSON.stringify(item), headers);
  }

  addReturnsValidationResult<T>(item: T, apiUrl: string): Observable<ValidationResultModel> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<ValidationResultModel>(apiUrl, JSON.stringify(item), headers);
  }

  addMultipleReturnsValidationResult<T>(item: T[], apiUrl: string): Observable<ValidationResultModel> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<ValidationResultModel>(apiUrl, JSON.stringify(item), headers);
  }

  add<T, TK = number>(item: T, apiUrl: string): Observable<TK> {
    return this.post(apiUrl, item);
  }

  post<T, TK = number>(apiUrl: string, item: T): Observable<TK> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<TK>(apiUrl, JSON.stringify(item), headers);
  }

  GetDocumentsBySetAndKey<T, TK = Document[]>(apiUrl: string, item: T): Observable<TK> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<TK>(apiUrl, JSON.stringify(item), headers);
  }

  postList<T>(apiUrl: string, coverTypesIds: number[]): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.post<T>(apiUrl, JSON.stringify(coverTypesIds), headers);
  }

  postWithNoData<T>(apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<T>(apiUrl, null, headers);
  }

  addFormData<T>(item: FormData, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<T>(apiUrl, JSON.stringify(item), headers);
  }

  SaveDocumentBinary<T>(item: FormData, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptionsAuthOnly();
    return this.http.post<T>(apiUrl, item, headers);
  }

  addReturnsModel<T>(item: T, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<T>(apiUrl, JSON.stringify(item), headers);
  }

  addReturnsBoolean<T>(item: T, apiUrl: string): Observable<boolean> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<boolean>(apiUrl, JSON.stringify(item), headers);
  }

  addMultipleNoUpdate<T>(items: T[], apiUrl: string): Observable<number> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.post<number>(apiUrl, JSON.stringify(items), headers);
  }

  addMultiple<T>(items: T[], apiUrl: string): Observable<number> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<number>(apiUrl, JSON.stringify(items), headers);
  }

  postFileText<T>(item: FormData, apiUrl: string): Observable<T[]> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptionsAuthTextResponseType();
    return this.http.post<T[]>(apiUrl, item, headers);
  }

  postFile<T>(item: FormData, apiUrl: string): Observable<T[]> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptionsAuthOnly();
    return this.http.post<T[]>(apiUrl, item, headers);
  }


  addMultipleReturnsArray<T>(body: any, apiUrl: string): Observable<T[]> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.post<T[]>(apiUrl, body, headers);
  }

  addMultipleReturnsBoolean<T>(body: any, apiUrl: string): Observable<boolean> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.post<boolean>(apiUrl, body, headers);
  }

  edit<T>(item: T, apiUrl: string): Observable<boolean> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.put<boolean>(apiUrl, JSON.stringify(item), headers);
  }

  editIsresolved<T>(item: T, apiUrl: string): Observable<number> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.put<number>(apiUrl, JSON.stringify(item), headers);
  }

  editReturnsModel<T>(item: T, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.put<T>(apiUrl, JSON.stringify(item), headers);
  }

  AddInDocumentToken<T>(item: T, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.put<T>(apiUrl, JSON.stringify(item), headers);
  }

  UploadDocument<T>(item: T, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.post<T>(apiUrl, JSON.stringify(item), headers);
  }

  editMultiple<T>(items: T[], apiUrl: string): Observable<boolean> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();

    return this.http.put<boolean>(apiUrl, JSON.stringify(items), headers);
  }

  remove<T>(id: any, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}/${id}`;
    const headers = this.getApiRequestOptions();

    return this.http.delete<T>(apiUrl, headers);
  }

  postGeneric<T, H>(apiUrl: string, selectedObject: T): Observable<H> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;

    const headers = this.getApiRequestOptions();
    return this.http.post<H>(apiUrl, JSON.stringify(selectedObject), headers);
  }

  postNonGeneric(url: string, data: any) {
    const requestOptions = this.getApiRequestOptions();
    return this.http.post(url, JSON.stringify(data), requestOptions);
  }

  postNoData(url: string) {
    const requestOptions = this.getApiRequestOptions();
    return this.http.post(url, null, requestOptions);
  }

  postDownloadPdf(url: string, downloadRequest: DownloadRequest) {
    const headerList = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/pdf'
    });
    const token = this.authService.getCurrentToken();
    if (token) {
      const accessToken = token;
      if (accessToken) {
        headerList.append('Authorization', `Bearer ${accessToken}`);
      }
    }

    const httpOptions = {
      headers: headerList,
      resquestType: 'blob'
    };

    return this.http.post(url, downloadRequest, httpOptions);
  }

  getString(apiUrl: string): Observable<string> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptionsAuthTextResponseType();
    return this.http.get<string>(apiUrl, headers);
  }

  postReturnObject<T>(apiUrl: string, object: any): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.post<T>(apiUrl, JSON.stringify(object), headers);
  }

  getBoolean(apiUrl: string): Observable<boolean> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptionsAuthTextResponseType();
    return this.http.get<boolean>(apiUrl, headers);
  }
}
