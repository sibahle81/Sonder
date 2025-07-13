using RMA.Common.Entities;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities.MediCare;
using RMA.Service.MediCare.Constants;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class CompCareIntegrationFacade : RemotingStatelessService, ICompCareIntegrationService
    {
        private readonly ISerializerService _serializer;
        private readonly IConfigurationService _configurationService;
        private readonly IServiceBusMessage _serviceBusMessage;
        private readonly IInvoiceCompCareMapService _invoiceCompCareMapService;

        public CompCareIntegrationFacade(StatelessServiceContext context,
            ISerializerService serializer,
            IConfigurationService configurationService,
            IServiceBusMessage serviceBusMessage,
            IInvoiceCompCareMapService invoiceCompCareMapService)
            : base(context)
        {
            _serializer = serializer;
            _configurationService = configurationService;
            _serviceBusMessage = serviceBusMessage;
            _invoiceCompCareMapService = invoiceCompCareMapService;
        }

        public async Task SendMedicalInvoiceResponseMessage(int invoiceId, Integrations.Contracts.Enums.ActionEnum action)
        {
            if (invoiceId > 0)
            {
                var invoiceCompCareMap = await _invoiceCompCareMapService.GetInvoiceCompCareMapByInvoiceId(invoiceId);

                if (invoiceCompCareMap != null)
                {
                    var medicalInvoiceResponseMessage = new MedicalInvoiceUpdateMessage()
                    {
                        MedicalInvoiceId = invoiceId,
                        CompCareMedicalInvoiceId = invoiceCompCareMap.CompCareInvoiceId,
                        CompCareClaimId = invoiceCompCareMap.CompCareClaimId,
                        Action = action
                    };
                    var messageBody = _serializer.Serialize(medicalInvoiceResponseMessage);

                    var enviroment = await _configurationService.GetModuleSetting(SystemSettings.IntegrationEnviroment);
                    var messageType = new MessageType
                    {
                        MessageId = Guid.NewGuid().ToString(),
                        MessageBody = messageBody,
                        From = MediCareConstants.MessageFrom,
                        To = MediCareConstants.MessageTo,
                        MessageTaskType = MediCareConstants.MessageTaskType012,
                        Environment = enviroment,
                        CorrelationID = invoiceCompCareMap.CompCareMessageId,
                        EnqueuedTime = DateTime.Now
                    };

                    var sendTopic = await _configurationService.GetModuleSetting(SystemSettings.MessageTypeSubscriptionServiceBusSendTopic);
                    var sendConnectionString = await _configurationService.GetModuleSetting(SystemSettings.MessageTypeSubscriptionServiceBusSendConnectionString);
                    var messageProperties = new Dictionary<string, string>
                    {
                        ["MessageTo"] = messageType.To,
                        ["MessageFrom"] = messageType.From,
                        ["Environment"] = messageType.Environment,
                        ["MessageTaskType"] = messageType.MessageTaskType
                    };

                    var producer = new ServiceBusTopicProducer<MessageType>(sendTopic, sendConnectionString);
                    await producer.PublishMessageAsync(messageType, null, messageProperties);
                    await _serviceBusMessage.AddServiceBusMessage(messageType);
                }
            }
        }
    }
}
