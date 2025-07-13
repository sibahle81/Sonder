import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../../../../shared-services-lib/src/lib/services/common/common.service';
import { AccountSearchResult } from '../models/account-search-result';

@Injectable()
export class AccountService {
  private rolePlayerApiUrl = 'clc/api/RolePlayer/RolePlayer';
  constructor(private readonly commonService: CommonService) { }

  searchAccounts(page: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<AccountSearchResult[]> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<AccountSearchResult[]>(`${this.rolePlayerApiUrl}/SearchAccounts/${page}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }
}
