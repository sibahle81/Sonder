import { Component, OnInit } from '@angular/core';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-payment-work-pool-container',
  templateUrl: './payment-work-pool-container.component.html',
  styleUrls: ['./payment-work-pool-container.component.css']
})
export class PaymentWorkPoolContainerComponent implements OnInit {

  currentUserLoggedIn: User;

  constructor(private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
  }
}
