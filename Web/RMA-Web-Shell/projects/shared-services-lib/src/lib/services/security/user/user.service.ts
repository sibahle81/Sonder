import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Lookup } from '../../../../../../shared-models-lib/src/lib/lookup/lookup';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { UserCompanyMap } from 'projects/clientcare/src/app/member-manager/models/user-company-map';
import { UserDetails } from 'projects/clientcare/src/app/member-manager/models/user-details';
import { UserContact } from 'projects/clientcare/src/app/member-manager/models/user-contact';
import { UserHealthcareproviderMap } from 'projects/medicare/src/app/healthcareprovider-register-manager/models/user-healthcareprovider-map';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { UserSearchRequest } from 'projects/shared-models-lib/src/lib/security/user-search-request';

@Injectable()
export class UserService {
    private tenantApi = 'sec/api/tenant';
    private apiUrl = 'sec/api/User';
    private apiUrlUserRegistration = 'sec/api/UserRegistration';

    constructor(private readonly commonService: CommonService) {
    }

    getUserDetails(email: string): Observable<User> {
        return this.commonService.getAll<User>(`${this.apiUrl}/SearchUserByEmail/${email}`);
    }

    getLastModifiedByUserDetails(email: string): Observable<User> {
        return this.commonService.getAll<User>(`${this.apiUrl}/SearchUserByEmail/${email}`);
    }

    getUsersByPermission(permission: string): Observable<User[]> {
        return this.commonService.getAll<User[]>(`${this.apiUrl}/ByPermission/${permission}`);
    }

    getUsersByRole(roles: string[]): Observable<User[]> {
        if (roles.length === 0) { return of([]); }
        let parameters = '';
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < roles.length; i++) {
            parameters += `&role=${encodeURI(roles[i])}`;
        }
        parameters = parameters.substr(1);
        const url = `${this.apiUrl}/SearchUsersByRole/${parameters}`;
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
        const url = `${this.apiUrl}/SearchUsersByRole/${parameters}`;
        return this.commonService.getAll<User[]>(url);
    }

    getUsersByRoleName(role: string): Observable<User[]> {
        const url = `${this.apiUrl}/SearchUsersByRoleName/${role}`;
        return this.commonService.getAll<User[]>(url);
    }

    search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, permissionFilter: string): Observable<PagedRequestResult<User>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<User>>(`${this.apiUrl}/Search/${permissionFilter}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    SearchUsersPermissionPageRequest(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, permissionFilter: string): Observable<PagedRequestResult<User>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<User>>(`${this.apiUrl}/SearchUsersPermissionPageRequest/${permissionFilter}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    getLastViewedUsers(): Observable<User[]> {
        return this.commonService.getAll<User[]>(`${this.apiUrl}/LastViewed`);
    }

    getUser(id: number): Observable<User> {
        return this.commonService.get<User>(id, `${this.apiUrl}`);
    }

    addUser(user: User): Observable<number> {
        return this.commonService.postGeneric<User, number>(`${this.apiUrl}`, user);
    }

    editUser(user: User): Observable<boolean> {
        return this.commonService.edit<User>(user, `${this.apiUrl}`);
    }

    resetPassword(user: User): Observable<boolean> {
        return this.commonService.edit<User>(user, `${this.apiUrl}/ResetPassword`);
    }

    getRoles(): Observable<Lookup[]> {
        return this.commonService.getAll<Lookup[]>(`${this.apiUrl}/GetRoles`);
    }

    getAuthenticationTypes(): Observable<Lookup[]> {
        return this.commonService.getAll<Lookup[]>(`${this.apiUrl}/GetAuthenticationTypes`);
    }

    getTenants(): Observable<Lookup[]> {
        return this.commonService.getAll<Lookup[]>(`${this.apiUrl}/GetTenants`);
    }

    getTenant(email: string): Observable<Tenant> {
        return this.commonService.get<Tenant>(email, this.tenantApi);
    }

    getUserHealthCareProviders(email: string): Observable<UserHealthCareProvider[]> {
        return this.commonService.getAll<UserHealthCareProvider[]>(`${this.apiUrl}/GetHealthCareProvidersLinkedToUser/${email}`);
    }

    getUserHealthCareProvidersForInternalUser(searchCriteria: string): Observable<UserHealthCareProvider[]> {
        return this.commonService.getAll<UserHealthCareProvider[]>(`${this.apiUrl}/GetHealthCareProvidersForInternalUser/${searchCriteria}`);
    }

    getHealthCareProviderIdLinkedToExternalUser(userId: number): Observable<number> {
        return this.commonService.get<number>(userId, `${this.apiUrl}/GetHealthCareProviderIdLinkedToExternalUser`);
    }

    saveUserHealthCareProviders(userHealthcareProviders: UserHealthCareProvider[], userId: number): Observable<number> {
        return this.commonService.postGeneric<UserHealthCareProvider[], number>(`${this.apiUrl}/SaveUserHealthCareProviders/${userId}`, userHealthcareProviders);
    }

    getPagedUserCompanyMap(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<UserCompanyMap>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<UserCompanyMap>>(`${this.apiUrl}/GetPagedUserCompanyMap/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    registerUserDetails(userDetails: UserDetails): Observable<boolean> {
        return this.commonService.postGeneric<UserDetails, boolean>(`${this.apiUrlUserRegistration}/RegisterUserDetails`, userDetails);
    }

    getUserByUsername(userName: string): Observable<User> {
        return this.commonService.getAll<User>(`${this.apiUrl}/ByUsername/${userName}`);
    }

    addUserCompanyMap(userCompanyMap: UserCompanyMap): Observable<number> {
        return this.commonService.postGeneric<UserCompanyMap, number>(`${this.apiUrl}/AddUserCompanyMap`, userCompanyMap);
    }

    editUserCompanyMap(userCompanyMap: UserCompanyMap): Observable<boolean> {
        return this.commonService.edit(userCompanyMap, `${this.apiUrl}/EditUserCompanyMap`);
    }

    getUserContact(userId: number): Observable<UserContact> {
        return this.commonService.getAll<UserContact>(`${this.apiUrl}/GetUserContact/${userId}`);
    }

    addUserContact(userContact: UserContact): Observable<number> {
        return this.commonService.postGeneric<UserContact, number>(`${this.apiUrl}/AddUserContact`, userContact);
    }

    editUserContact(userContact: UserContact): Observable<boolean> {
        return this.commonService.edit(userContact, `${this.apiUrl}/EditUserContact`);
    }

    getLinkedMember(userId: number): Observable<number> {
        return this.commonService.getAll<number>(`${this.apiUrl}/GetLinkedMember/${userId}`);
    }

    getUserCompanyMaps(userId: number): Observable<UserCompanyMap[]> {
        return this.commonService.getAll<UserCompanyMap[]>(`${this.apiUrl}/GetUserCompanyMaps/${userId}`);
    }

    getPendingCompanyMaps(companyId: number, activationId: number): Observable<UserCompanyMap[]> {
        return this.commonService.getAll<UserCompanyMap[]>(`${this.apiUrl}/GetPendingUserCompanyMaps/${companyId}/${activationId}`);
    }

    getUserActivationUserDetailsByUserActivationId(userActivationId: number): Observable<UserDetails> {
        return this.commonService.getAll<UserDetails>(`${this.apiUrlUserRegistration}/GetUserActivationUserDetailsByUserActivationId/${userActivationId}`);
    }

    resendUserActivationEmail(userActivationId: number): Observable<boolean> {
        return this.commonService.getAll<boolean>(`${this.apiUrlUserRegistration}/ResendUserActivationEmail/${userActivationId}`);
    }

    isUserPendingRegistration(userName: string): Observable<boolean> {
        return this.commonService.getAll<boolean>(`${this.apiUrlUserRegistration}/IsUserPendingRegistration/${userName}`);
    }

    getPendingUserActivation(userName: string): Observable<number> {
        return this.commonService.getAll<number>(`${this.apiUrlUserRegistration}/GetPendingUserActivation/${userName}`);
    }

    searchUsersByPermissions(permission: string): Observable<User[]> {
        return this.commonService.getAll<User[]>(`${this.apiUrl}/SearchUsersByPermissions/${permission}`);
    }

    getPagedUserHealthCareProviderMap(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<UserHealthcareproviderMap>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<UserHealthcareproviderMap>>(`${this.apiUrl}/GetPagedUserHealthCareProviderMap/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    getPagedRoles(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Role>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<Role>>(`${this.apiUrl}/GetPagedRoles/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    getPagedUsers(userSearchRequest: UserSearchRequest): Observable<PagedRequestResult<User>> {
        return this.commonService.postGeneric<UserSearchRequest, PagedRequestResult<User>>(`${this.apiUrl}/GetPagedUsers/`, userSearchRequest);
    }

    getRole(roleId: number): Observable<Role> {
        return this.commonService.get<Role>(roleId, `${this.apiUrl}/GetRole`);
    }
}
