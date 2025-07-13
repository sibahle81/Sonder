import { OverlayService } from './services/overlay/overlay.service';
import { NgModule } from '@angular/core';
import { MenuService } from './services/menu/menu.service';
import { UserPreferenceService } from './services/userpreferenceservice/userpreferenceservice.service';
import { TenantPreferenceService } from './services/tenant-preference/tenant-preference.service';
import { SendEmailService } from './services/email-request/send-email.service';
import { SendSmsService } from './services/sms-request/send-sms.service';
import { LookupService } from './services/lookup/lookup.service';
import { UserService } from './services/security/user/user.service';
import { UploadService } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.service';
import { RoleService } from './services/security/role/role.service';
import { CacheService } from './services/cache/cache.service';
import { Cache } from './services/cache/cache';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CachingInterceptor } from './http-interceptors/caching-interceptor';
import { LoggingInterceptor } from './http-interceptors/logging-interceptor';
import { UserIdleModule } from './services/user-idle/user-idle.module';
import { IntegrationService } from './services/integrations.service';
import { BankAccountTypeService } from './services/lookup/bank-account-type.service';
import { BankBranchService } from './services/lookup/bank-branch.service';
import { BankService } from './services/lookup/bank.service';
import { CommunicationTypeService } from './services/lookup/communication-type.service';
import { PaymentMethodService } from './services/lookup/payment-method.service';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { AddressService } from './services/address/address.service';
import { MedicalEstimatesService } from './services/medical-estimates/medical-estimates.service';
import { ServiceBusMessageService } from './services/service-bus-message/service-bus-message-service';
import { DataExchangeService } from './services/data-exchange/data-exchange.service';

export const httpInterceptorProviders = [
  { provide: Cache, useClass: CacheService },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true }
];

@NgModule({
  declarations: [
  ],
  imports: [
    // Optionally you can set time for `idle`, `timeout` and `ping` in seconds.
    // Default values: `idle` is 600 (10 minutes), `timeout` is 300 (5 minutes)
    // and `ping` is 120 (2 minutes).
    UserIdleModule.forRoot({ idle: 600, timeout: 60, ping: 120 })
  ],
  exports: [
  ],
  providers: [
    SendEmailService,
    SendSmsService,
    LookupService,
    MenuService,
    RoleService,
    UserService,
    UserPreferenceService,
    TenantPreferenceService,
    UploadService,
    httpInterceptorProviders,
    IntegrationService,
    BankAccountTypeService,
    BankBranchService,
    BankService,
    CommunicationTypeService,
    PaymentMethodService,
    ProductOptionService,
    AddressService,
    ServiceBusMessageService,
    MedicalEstimatesService,
    OverlayService,
    DataExchangeService,
  ]
})
export class SharedServicesLibModule { }
