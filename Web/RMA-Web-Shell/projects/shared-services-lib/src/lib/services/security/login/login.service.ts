// wiki: http://bit.ly/2CDDfKw
// Authenticates the user with the server.

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from '../auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserRequest } from 'projects/shared-models-lib/src/lib/security/user-request';

@Injectable()
export class LoginService {
  private tenantApi = 'sec/tenant';
  private loginApi = 'sec/api/Login';

  constructor(
    private readonly commonService: CommonService,
    private readonly authService: AuthService) {
  }

  login(user: User): Observable<any> {
    return this.authService.login({ username: user.email, password: user.password });
  }

  getTenant(email: string): Observable<User> {
    return this.commonService.get<User>(email, this.tenantApi);
  }

  forgotPassword(userName: string): Observable<any> {
    return this.commonService.getUnAuth<any>(userName, `${this.loginApi}/ForgotPassword`);
  }

  changePassword(userRequest: UserRequest): Observable<boolean> {
    return this.commonService.edit<UserRequest>(userRequest, 'User');
  }
}
