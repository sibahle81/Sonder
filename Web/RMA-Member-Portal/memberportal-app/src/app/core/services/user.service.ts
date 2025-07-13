import { Injectable } from '@angular/core';
import { User } from 'src/app/core/models/security/user.model';
import { Observable, of } from 'rxjs';
import { ConstantApi } from 'src/app/shared/constants/constant';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { PagedRequestResult } from '../models/pagination/PagedRequestResult.model';
import { Tenant } from '../models/security/Tenant.model';
import { UserDetails } from '../models/security/user-details.model';
import { CommonService } from './common/common.service';


@Injectable()
export class UserService {

    constructor(private readonly commonService: CommonService) {
    }

    getUserDetails(email: string): Observable<UserDetails> {
        return this.commonService.getAll<UserDetails>(`${ConstantApi.UserApiUrl}/SearchUserByEmail/${email}`);
    }

    getLastModifiedByUserDetails(email: string): Observable<UserDetails> {
        return this.commonService.getAll<UserDetails>(`${ConstantApi.UserApiUrl}/SearchUserByEmail/${email}`);
    }

    getUsersByPermission(permission: string): Observable<User[]> {
        return this.commonService.getAll<User[]>(`${ConstantApi.UserApiUrl}/ByPermission/${permission}`);
    }

    getUsersByRole(roles: string[]): Observable<User[]> {
        if (roles.length === 0) { return of([]); }
        let parameters = '';
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < roles.length; i++) {
            parameters += `&role=${encodeURI(roles[i])}`;
        }
        parameters = parameters.substr(1);
        const url = `${ConstantApi.UserApiUrl}/SearchUsersByRole/${parameters}`;
        return this.commonService.getAll<User[]>(url);
    }

    getUsersByRoleIds(roles: string[]): Observable<User[]> {
        if (roles.length === 0) { return of([]); }
        let parameters = '';
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < roles.length; i++) {
            parameters += `,${encodeURI(roles[i])}`;
        }
        parameters = parameters.substr(1);
        const url = `${ConstantApi.UserApiUrl}/SearchUsersByRole/${parameters}`;
        return this.commonService.getAll<User[]>(url);
    }

    getUsersByRoleName(role: string): Observable<User[]> {
        const url = `${ConstantApi.UserApiUrl}/SearchUsersByRoleName/${role}`;
        return this.commonService.getAll<User[]>(url);
    }

    search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<User>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<User>>(`${ConstantApi.UserApiUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    getLastViewedUsers(): Observable<User[]> {
        return this.commonService.getAll<User[]>(`${ConstantApi.UserApiUrl}/LastViewed`);
    }

    getUser(id: number): Observable<User> {
        return this.commonService.get<User>(id, `${ConstantApi.UserApiUrl}`);
    }

    addUser(user: User): Observable<number> {
        return this.commonService.add<User>(user, `${ConstantApi.UserApiUrl}`);
    }

    editUser(user: User): Observable<boolean> {
        return this.commonService.edit<User>(user, `${ConstantApi.UserApiUrl}`);
    }

    resetPassword(user: User): Observable<boolean> {
        return this.commonService.edit<User>(user, `${ConstantApi.UserApiUrl}/ResetPassword`);
    }

    getRoles(): Observable<Lookup[]> {
        return this.commonService.getAll<Lookup[]>(`${ConstantApi.UserApiUrl}/GetRoles`);
    }

    getUserTypes(): Observable<Lookup[]> {
        return this.commonService.getAll<Lookup[]>(`${ConstantApi.UserApiUrl}/GetUserTypes`);
    }

    getTenants(): Observable<Lookup[]> {
        return this.commonService.getAll<Lookup[]>(`${ConstantApi.UserApiUrl}/GetTenants`);
    }

    getTenant(email: string): Observable<Tenant> {
        return this.commonService.get<Tenant>(email, ConstantApi.TenantApiUrl);
    }

}
