import { Component, OnInit } from '@angular/core';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'work-pool-container',
  templateUrl: './work-pool-container.component.html',
  styleUrls: ['./work-pool-container.component.css']
})
export class WorkPoolContainerComponent implements OnInit {

  currentUserLoggedIn: User;

  constructor(
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
  }
}
