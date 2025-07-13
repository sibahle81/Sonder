import { Component, OnInit} from '@angular/core';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { PaymentPoolViewTypeEnum} from 'projects/fincare/src/app/shared/enum/payment-pool-view-type-enum';

@Component({
  selector: 'app-payment-claim-list',
  templateUrl: './payment-claim-list.component.html',
  styleUrls: ['./payment-claim-list.component.css']
})
export class PaymentClaimListComponent implements OnInit {
  
  currentUserObject: User;
  loggedInUserRole: string;
  hasSubmitPaymentPermission: boolean;
  hasPermissionSubmitAllPayments: boolean;
  currentUserEmail:string;
  triggerReset:boolean;
  paymentPoolView: PaymentPoolViewTypeEnum;

  constructor(private readonly authService: AuthService) 
  {}

  ngOnInit(): void {
    
    this.paymentPoolView = PaymentPoolViewTypeEnum.ClaimsList;

    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserRole = this.currentUserObject.roleName;
    
    this.hasSubmitPaymentPermission = userUtility.hasPermission('Submit Payment');
    this.hasPermissionSubmitAllPayments = userUtility.hasPermission('Submit All Payments');
    this.currentUserEmail = this.currentUserObject.email;
    this.triggerReset = false;
  }
}
