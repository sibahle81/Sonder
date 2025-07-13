import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signout-callback',
  template: `<div></div>`,
  styles: [
  ]
})
export class SignoutRedirectCallbackComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router) { }

  public ngOnInit(): void {
    this.authService.completeLogout().then(_ => {
      this.router.navigate(['/'], { replaceUrl: true });
    });
  }
}
