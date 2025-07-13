using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IServiceBusMessage : IService
    {
        Task<string> AddServiceBusMessage(MessageType messageType);
        Task UpdateBusMessage(MessageType messageType);
        Task<bool> CheckIfMessageHasBeenSent(int personEventId, string messageTo, string messageFrom, string correlationId);
        Task<List<MessageType>> GetUnProcessedSTPMessages();
        Task<MessageType> GetServiceBusMessagesById(int serviceBusMessageId);
        Task<List<MessageType>> GetSwitchBatchServiceBusMessages();
        Task<List<MessageType>> GetCompcareContactCareServiceBusMessages();
        Task<bool> CheckIfMessageHasBeenSentByMesageBody(int Id, string messageTo, string messageFrom, string correlationId, string messageBody);
        Task<bool> CheckIfMessageTypeHasBeenSentByMessageUniqueId(string messageUniqueId);
        Task<bool> CheckIfMessageTypeHasBeenSent(MessageType messageType);
    }
}
