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

namespace RMA.Service.ScanCare
{
    public partial class ContainerConfiguration
    {
        private static void HostOurServicesPartial(ContainerBuilder builder)
        {
            builder.HostStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.IDocumentIndexService, RMA.Service.ScanCare.Services.Document.DocumentIndexFacade>(AppNames.ScanCare, AppPrefix.Document);
            builder.HostServiceBusListener<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentAutoIndexListener, RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentAutoIndexListener>(AppPrefix.AutoProcessing);
            builder.HostStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentAutoProcessingService, RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentAutoProcessingService>(AppNames.ScanCare, AppPrefix.AutoProcessing);
            builder.HostStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentClassifierService, RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentClassifierService>(AppNames.ScanCare, AppPrefix.AutoProcessing);
            builder.HostServiceBusListener<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentDownloadListener, RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentDownloadListener>(AppPrefix.AutoProcessing);
            builder.HostServiceBusListener<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentSaveListener, RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentSaveListener>(AppPrefix.AutoProcessing);
            builder.HostStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentSplitterService, RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentSplitterService>(AppNames.ScanCare, AppPrefix.AutoProcessing);
            builder.HostStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IMailboxConfigurationService, RMA.Service.ScanCare.Services.Document.AutoProcessing.MailboxConfigurationFacade>(AppNames.ScanCare, AppPrefix.AutoProcessing);
            builder.HostServiceBusListener<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IManualDocumentIndexListener, RMA.Service.ScanCare.Services.Document.AutoProcessing.ManualDocumentIndexListener>(AppPrefix.AutoProcessing);
            // DO NOT EDIT THIS FILE MANUALLY, IT IS GENERATED FROM A TEMPLATE!
			
            //START OF API References
			//builder.UseStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.IDocumentIndexService>(AppNames.ScanCare, AppPrefix.Document);
			//builder.UseStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentAutoProcessingService>(AppNames.ScanCare, AppPrefix.AutoProcessing);
			//builder.UseStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentClassifierService>(AppNames.ScanCare, AppPrefix.AutoProcessing);
			//builder.UseStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentSplitterService>(AppNames.ScanCare, AppPrefix.AutoProcessing);
			//builder.UseStatelessService<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IMailboxConfigurationService>(AppNames.ScanCare, AppPrefix.AutoProcessing);
            //START OF UNIT TEST REFERENCES
			//builder.RegisterType<RMA.Service.ScanCare.Services.Document.DocumentIndexFacade>().AsSelf().As<RMA.Service.ScanCare.Contracts.Interfaces.Document.IDocumentIndexService>();
			//builder.RegisterType<RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentAutoProcessingFacade>().AsSelf().As<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentAutoProcessingService>();
			//builder.RegisterType<RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentClassifierFacade>().AsSelf().As<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentClassifierService>();
			//builder.RegisterType<RMA.Service.ScanCare.Services.Document.AutoProcessing.DocumentSplitterFacade>().AsSelf().As<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IDocumentSplitterService>();
			//builder.RegisterType<RMA.Service.ScanCare.Services.Document.AutoProcessing.MailboxConfigurationFacade>().AsSelf().As<RMA.Service.ScanCare.Contracts.Interfaces.Document.AutoProcessing.IMailboxConfigurationService>();
        }
    }
}
