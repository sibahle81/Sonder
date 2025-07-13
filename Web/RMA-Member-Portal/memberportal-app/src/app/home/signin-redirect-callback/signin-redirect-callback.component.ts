import { AuthService } from '../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/security/user.model';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { Subscription } from 'rxjs';
import { ignoreElements } from 'rxjs/operators';

@Component({
  selector: 'app-signin-callback',
  template: `<div></div>`
})
export class SigninRedirectCallbackComponent implements OnInit {
  authSubscription: Subscription
  user: User;
  constructor(
    private authService: AuthService,
    private router: Router) { }

  public ngOnInit(): void {
    this.authService.completeLogin().then(user => {
      // Routing to be added based on the Role
      switch (user.role) {
        case ConstantPlaceholder.MemberPortalAdministratorRole: break;
        case ConstantPlaceholder.MemberPortalIndividualRole:
          this.router.navigateByUrl('/');
          break;
        case ConstantPlaceholder.MemberPortalBrokerRole:
          this.router.navigateByUrl('broker-disclaimer');
          break;
        case '': break;
        default:   this.router.navigateByUrl('/'); break;
      }
    }).catch(error =>{
     console.error(error);
    });
  }
}
