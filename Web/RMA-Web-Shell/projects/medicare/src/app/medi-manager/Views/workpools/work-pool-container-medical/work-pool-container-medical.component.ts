import { Component, OnInit } from '@angular/core';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-work-pool-container-medical',
  templateUrl: './work-pool-container-medical.component.html',
  styleUrls: ['./work-pool-container-medical.component.css']
})
export class WorkPoolContainerMedicalComponent implements OnInit {

  currentUserLoggedIn: User;

  constructor(
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
  }
}
