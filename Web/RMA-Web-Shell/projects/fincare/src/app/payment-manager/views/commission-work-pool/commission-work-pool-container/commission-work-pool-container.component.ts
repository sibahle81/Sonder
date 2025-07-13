import { Component, OnInit } from '@angular/core';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-commission-work-pool-container',
  templateUrl: './commission-work-pool-container.component.html',
  styleUrls: ['./commission-work-pool-container.component.css']
})
export class CommissionWorkPoolContainerComponent implements OnInit {

  currentUserLoggedIn: User;

  constructor(private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
  }
}

