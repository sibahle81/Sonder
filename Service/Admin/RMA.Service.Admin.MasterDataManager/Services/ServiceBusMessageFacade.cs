using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class ServiceBusMessageFacade : RemotingStatelessService, IServiceBusMessage
    {
        private readonly IRepository<common_ServiceBusMessage> _serviceBusMessageRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public ServiceBusMessageFacade(
            IRepository<common_ServiceBusMessage> serviceBusMessageRepository,
            IDbContextScopeFactory dbContextScopeFactory,
            StatelessServiceContext context,
            IMapper mapper) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _serviceBusMessageRepository = serviceBusMessageRepository;
            _mapper = mapper;
        }

        public async Task<string> AddServiceBusMessage(MessageType messageType)
        {
            Contract.Requires(messageType != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                messageType.MessageProcessedTime = DateTimeHelper.SaNow;
                var entity = _mapper.Map<common_ServiceBusMessage>(messageType);
                _serviceBusMessageRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return messageType.MessageId;
            }
        }

        public async Task UpdateBusMessage(MessageType messageType)
        {
            Contract.Requires(messageType != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _serviceBusMessageRepository.FirstOrDefaultAsync(x => x.MessageId == messageType.MessageId);
                if (entity != null)
                {
                    if (!string.IsNullOrEmpty(messageType.MessageProcessingStatusText))
                        entity.MessageProcessingStatusText = messageType.MessageProcessingStatusText;

                    entity.MessageProcessingCompletionTime = DateTimeHelper.SaNow;
                    _serviceBusMessageRepository.Update(entity);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<bool> CheckIfMessageTypeHasBeenSent(MessageType messageType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var message = await _serviceBusMessageRepository.FirstOrDefaultAsync(a => a.From == messageType.From
                                                                                        && a.To == messageType.To
                                                                                        && a.MessageBody == messageType.MessageBody
                                                                                        && a.MessageTaskType == messageType.MessageTaskType);
                return message != null;
            }
        }

        public async Task<bool> CheckIfMessageTypeHasBeenSentByMessageUniqueId(string messageUniqueId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var message = await _serviceBusMessageRepository.FirstOrDefaultAsync(a => a.MessageUniqueId == messageUniqueId);
                return message != null;
            }
        }

        public async Task<bool> CheckIfMessageHasBeenSent(int Id, string messageTo, string messageFrom, string correlationId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var messageType = await _serviceBusMessageRepository.FirstOrDefaultAsync(a => a.MessageBody.Contains(Id.ToString())
                                                                                        && a.From == messageFrom
                                                                                        && a.To == messageTo
                                                                                        && a.CorrelationId == correlationId);
                return messageType != null;
            }
        }

        public async Task<bool> CheckIfMessageHasBeenSentByMesageBody(int Id, string messageTo, string messageFrom, string correlationId, string messageBody)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var messageType = await _serviceBusMessageRepository.FirstOrDefaultAsync(a => a.MessageBody.Contains(Id.ToString())
                                                                                        && a.From == messageFrom
                                                                                        && a.To == messageTo
                                                                                        && a.CorrelationId == correlationId
                                                                                        && a.MessageBody == messageBody);
                return messageType != null;
            }
        }

        public async Task<MessageType> GetServiceBusMessagesById(int serviceBusMessageId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var stpMessage = await _serviceBusMessageRepository.FirstOrDefaultAsync(x => x.ServiceBusMessageId == serviceBusMessageId);

                return _mapper.Map<MessageType>(stpMessage);
            }
        }

        public async Task<List<MessageType>> GetSwitchBatchServiceBusMessages()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var messages = await _serviceBusMessageRepository.Where(x => x.MessageTaskType == "msi" && !x.MessageProcessingCompletionTime.HasValue).ToListAsync();

                return _mapper.Map<List<MessageType>>(messages);
            }
        }

        public async Task<List<MessageType>> GetCompcareContactCareServiceBusMessages()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var messages = await _serviceBusMessageRepository.Where(x => x.MessageTaskType == "referral" && !x.MessageProcessingCompletionTime.HasValue).ToListAsync();

                return _mapper.Map<List<MessageType>>(messages);
            }
        }

        public async Task<List<MessageType>> GetUnProcessedSTPMessages()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var stpMessages = await _serviceBusMessageRepository.Where(x => x.MessageTaskType == "001" && x.MessageProcessingStatusText.Contains("Error")).ToListAsync();

                return _mapper.Map<List<MessageType>>(stpMessages);
            }
        }
    }
}
