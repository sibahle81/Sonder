﻿
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------
using Autofac;
using RMA.Common.Constants;
using RMA.Common.Service.Extensions;

namespace RMA.Service.Integrations
{
    public partial class ContainerConfiguration
    {
        private static void HostOurServicesPartial(ContainerBuilder builder)
        {
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.AzureBlob.IBinaryStorageService, RMA.Service.Integrations.Services.AzureBlob.BinaryStorageFacade>(AppNames.Integrations, AppPrefix.AzureBlob);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.CompCare.ICCClaimService, RMA.Service.Integrations.Services.CompCare.CCClaimFacade>(AppNames.Integrations, AppPrefix.CompCare);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.CompCare.IMedicalReportService, RMA.Service.Integrations.Services.CompCare.MedicalReportFacade>(AppNames.Integrations, AppPrefix.CompCare);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.EuropAssistNotification.IEuropAssistNotificationService, RMA.Service.Integrations.Services.EuropAssistNotification.EuropAssistNotificationFacade>(AppNames.Integrations, AppPrefix.EuropAssistNotification);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Exchange.IExchangeMonitorService, RMA.Service.Integrations.Services.Exchange.ExchangeMonitorService>(AppNames.Integrations, AppPrefix.Exchange);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Fspe.IFspeImportIntegrationService, RMA.Service.Integrations.Services.Fspe.FspeImportIntegrationFacade>(AppNames.Integrations, AppPrefix.Fspe);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Fspe.IFspeService, RMA.Service.Integrations.Services.Fspe.FspeFacade>(AppNames.Integrations, AppPrefix.Fspe);
            builder.HostServiceBusListener<RMA.Service.Integrations.Contracts.Interfaces.Hyphen.IHyphenAccountVerificationResponseListener, RMA.Service.Integrations.Services.Hyphen.HyphenAccountVerificationResponseListener>(AppPrefix.Hyphen);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Hyphen.IHyphenAccountVerificationService, RMA.Service.Integrations.Services.Hyphen.HyphenAccountVerificationFacade>(AppNames.Integrations, AppPrefix.Hyphen);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Qlink.IQlinkIntegrationService, RMA.Service.Integrations.Services.Qlink.QlinkIntegrationFacade>(AppNames.Integrations, AppPrefix.Qlink);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Sms.ISmsRequestService, RMA.Service.Integrations.Services.Sms.SmsRequestFacade>(AppNames.Integrations, AppPrefix.Sms);
            builder.HostStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Vopd.IVopdRequestProcessorService, RMA.Service.Integrations.Services.Vopd.VopdRequestProcessorFacade>(AppNames.Integrations, AppPrefix.Vopd);
            // DO NOT EDIT THIS FILE MANUALLY, IT IS GENERATED FROM A TEMPLATE!
			
            //START OF API References
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.AzureBlob.IBinaryStorageService>(AppNames.Integrations, AppPrefix.AzureBlob);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.CompCare.ICCClaimService>(AppNames.Integrations, AppPrefix.CompCare);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.CompCare.IMedicalReportService>(AppNames.Integrations, AppPrefix.CompCare);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.EuropAssistNotification.IEuropAssistNotificationService>(AppNames.Integrations, AppPrefix.EuropAssistNotification);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Exchange.IExchangeMonitorService>(AppNames.Integrations, AppPrefix.Exchange);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Fspe.IFspeImportIntegrationService>(AppNames.Integrations, AppPrefix.Fspe);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Fspe.IFspeService>(AppNames.Integrations, AppPrefix.Fspe);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Hyphen.IHyphenAccountVerificationService>(AppNames.Integrations, AppPrefix.Hyphen);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Qlink.IQlinkIntegrationService>(AppNames.Integrations, AppPrefix.Qlink);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Sms.ISmsRequestService>(AppNames.Integrations, AppPrefix.Sms);
			//builder.UseStatelessService<RMA.Service.Integrations.Contracts.Interfaces.Vopd.IVopdRequestProcessorService>(AppNames.Integrations, AppPrefix.Vopd);
            //START OF UNIT TEST REFERENCES
			//builder.RegisterType<RMA.Service.Integrations.Services.AzureBlob.BinaryStorageFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.AzureBlob.IBinaryStorageService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.CompCare.CCClaimFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.CompCare.ICCClaimService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.CompCare.MedicalReportFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.CompCare.IMedicalReportService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.EuropAssistNotification.EuropAssistNotificationFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.EuropAssistNotification.IEuropAssistNotificationService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.Exchange.ExchangeMonitorFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.Exchange.IExchangeMonitorService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.Fspe.FspeImportIntegrationFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.Fspe.IFspeImportIntegrationService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.Fspe.FspeFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.Fspe.IFspeService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.Hyphen.HyphenAccountVerificationFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.Hyphen.IHyphenAccountVerificationService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.Qlink.QlinkIntegrationFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.Qlink.IQlinkIntegrationService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.Sms.SmsRequestFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.Sms.ISmsRequestService>();
			//builder.RegisterType<RMA.Service.Integrations.Services.Vopd.VopdRequestProcessorFacade>().AsSelf().As<RMA.Service.Integrations.Contracts.Interfaces.Vopd.IVopdRequestProcessorService>();
        }
    }
}
