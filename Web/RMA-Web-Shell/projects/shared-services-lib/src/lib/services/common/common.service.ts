import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../security/auth/auth.service';
import { DownloadRequest } from '../download-request/download-request';


/** @description Common functions for angular services. */
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private baseUrl = '';

  constructor(
    private http: HttpClient,
    private readonly authService: AuthService) {
    const configEnv = environment.appUrl;
    if (configEnv === '') {
      this.baseUrl = window.location.protocol + '//' + window.location.host;
    } else {
      this.baseUrl = `${environment.appUrl}`;
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
    const tokens = this.authService.getCurrentTokens();
    if (tokens != null) {
      const accessToken = tokens.access_token;
      if (accessToken) {
        return {
          headers: new HttpHeaders(
            {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
              Authorization: 'Bearer ' + accessToken
            }
          )
        };
      }
    } else {
      return {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        })
      };
    }
  }

  getApiRequestOptionsAuthTextResponseType(): object {
    const tokens = this.authService.getCurrentTokens();
    if (tokens != null) {
      const accessToken = tokens.access_token;
      if (accessToken) {
        return {
          headers: new HttpHeaders(
            {
              Authorization: 'Bearer ' + accessToken,
              'Access-Control-Allow-Origin': '*'
            }
          ),
          responseType: 'text'
        };
      }
    } else {
      return { headers: new HttpHeaders({}) };
    }
  }

  getApiRequestOptionsAuthOnly(): object {
    const tokens = this.authService.getCurrentTokens();
    if (tokens != null) {
      const accessToken = tokens.access_token;
      if (accessToken) {
        return {
          headers: new HttpHeaders(
            {
              Authorization: 'Bearer ' + accessToken,
              'Access-Control-Allow-Origin': '*'
            }
          )
        };
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

  SaveDocumentBinary<T>(item: FormData, apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptionsAuthOnly();
    return this.http.post<T>(apiUrl, item, headers);
  }

  addMultipleReturnsString<T>(body: any, apiUrl: string): Observable<number> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.post<number>(apiUrl, body, headers);
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

  postGeneric<T,H>(apiUrl: string, selectedObject: T): Observable<H> {
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

  postWithNoData<T>(apiUrl: string): Observable<T> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptions();
    return this.http.post<T>(apiUrl, null, headers);
  }

  postDownloadPdf(url: string, downloadRequest: DownloadRequest) {
    const headerList = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/pdf'
    });
    const tokens = this.authService.getCurrentTokens();
    if (tokens != null) {
      const accessToken = tokens.access_token;
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

  getBoolean(apiUrl: string): Observable<boolean> {
    apiUrl = `${this.baseUrl}/${apiUrl}`;
    const headers = this.getApiRequestOptionsAuthTextResponseType();
    return this.http.get<boolean>(apiUrl, headers);
  }
}
