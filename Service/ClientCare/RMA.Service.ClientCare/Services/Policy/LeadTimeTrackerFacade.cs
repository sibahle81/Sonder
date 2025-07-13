
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class LeadTimeTrackerFacade : RemotingStatelessService, ILeadTimeTrackerService
    {

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IRepository<client_QlinkTransaction> _qlinkTransactionRepository;
        private readonly IRepository<Load_LeadTimeTracker> _leadTimeTrackerRepository;
        private const int qlinkSuccessfullStatusCode = 200;

        public LeadTimeTrackerFacade(
           StatelessServiceContext context,
           IDbContextScopeFactory dbContextScopeFactory,
           IRepository<policy_Policy> policyRepository,
           IRepository<client_QlinkTransaction> qlinkTransactionRepository,
           IRepository<Load_LeadTimeTracker> leadTimeTrackerRepository

         ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _qlinkTransactionRepository = qlinkTransactionRepository;
            _leadTimeTrackerRepository = leadTimeTrackerRepository;
        }

        public async Task<bool> CreateLeadTimeTrackerAsyn(string messageId, Contracts.Entities.Policy.CFP.PolicyRequest policyRequest)
        {
            Contract.Requires(policyRequest != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var createdDate = DateTimeHelper.SaNow;

                var existingLead = await _leadTimeTrackerRepository.FirstOrDefaultAsync(x => x.LeadClaimReference == policyRequest.RequestGUID);
                //Lead should have only one entry.
                if (existingLead != null)
                {
                    existingLead.ServiceBusMessageId = messageId; //This is the MessageID from the serviceBus Table
                    existingLead.LeadClaimReference = policyRequest.RequestGUID;
                    existingLead.LeadSubmitDate = policyRequest.LeadSubmittedDate == DateTime.MinValue ? createdDate : policyRequest.LeadSubmittedDate;
                    existingLead.LeadApiReceivedDate = policyRequest.LeadAPIReceivedDate == DateTime.MinValue ? createdDate : policyRequest.LeadAPIReceivedDate;
                    existingLead.LeadServiceBusQueuedDate = policyRequest.LeadServiceBusQueuedDate == DateTime.MinValue ? createdDate : policyRequest.LeadServiceBusQueuedDate;
                    existingLead.IsDeleted = false;
                    existingLead.CreatedBy = RmaIdentity.Email;
                    existingLead.CreatedDate = createdDate;
                    existingLead.ModifiedBy = RmaIdentity.Email;
                    existingLead.ModifiedDate = createdDate;

                    _leadTimeTrackerRepository.Update(existingLead);
                }
                else
                {
                    var leadTimeTracker = new Load_LeadTimeTracker
                    {
                        ServiceBusMessageId = messageId, //This is the MessageID from the serviceBus Table
                        LeadClaimReference = policyRequest.RequestGUID,
                        LeadSubmitDate = policyRequest.LeadSubmittedDate == DateTime.MinValue ? createdDate : policyRequest.LeadSubmittedDate,
                        LeadApiReceivedDate = policyRequest.LeadAPIReceivedDate == DateTime.MinValue ? createdDate : policyRequest.LeadAPIReceivedDate,
                        LeadServiceBusQueuedDate = policyRequest.LeadServiceBusQueuedDate == DateTime.MinValue ? createdDate : policyRequest.LeadServiceBusQueuedDate,
                        IsDeleted = false,
                        CreatedBy = RmaIdentity.Email,
                        CreatedDate = createdDate,
                        ModifiedBy = RmaIdentity.Email,
                        ModifiedDate = createdDate
                    };

                    _leadTimeTrackerRepository.Create(leadTimeTracker);
                }

                return await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
        }
        public async Task<bool> CreateLeadTimeTrackerMvpAsyn(string messageId, Contracts.Entities.Policy.MVP.PolicyRequest policyRequest)
        {
            Contract.Requires(policyRequest != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var createdDate = DateTimeHelper.SaNow;

                var existingLead = await _leadTimeTrackerRepository.FirstOrDefaultAsync(x => x.LeadClaimReference == policyRequest.RequestGUID);
                //Lead should have only one entry.
                if (existingLead != null)
                {
                    existingLead.ServiceBusMessageId = messageId; //This is the MessageID from the serviceBus Table
                    existingLead.LeadClaimReference = policyRequest.RequestGUID;
                    existingLead.LeadSubmitDate = policyRequest.LeadSubmittedDate == DateTime.MinValue ? createdDate : policyRequest.LeadSubmittedDate;
                    existingLead.LeadApiReceivedDate = policyRequest.LeadAPIReceivedDate == DateTime.MinValue ? createdDate : policyRequest.LeadAPIReceivedDate;
                    existingLead.LeadServiceBusQueuedDate = policyRequest.LeadServiceBusQueuedDate == DateTime.MinValue ? createdDate : policyRequest.LeadServiceBusQueuedDate;
                    existingLead.IsDeleted = false;
                    existingLead.CreatedBy = RmaIdentity.Email;
                    existingLead.CreatedDate = createdDate;
                    existingLead.ModifiedBy = RmaIdentity.Email;
                    existingLead.ModifiedDate = createdDate;

                    _leadTimeTrackerRepository.Update(existingLead);
                }
                else
                {
                    var leadTimeTracker = new Load_LeadTimeTracker
                    {
                        ServiceBusMessageId = messageId, //This is the MessageID from the serviceBus Table
                        LeadClaimReference = policyRequest.RequestGUID,
                        LeadSubmitDate = policyRequest.LeadSubmittedDate == DateTime.MinValue ? createdDate : policyRequest.LeadSubmittedDate,
                        LeadApiReceivedDate = policyRequest.LeadAPIReceivedDate == DateTime.MinValue ? createdDate : policyRequest.LeadAPIReceivedDate,
                        LeadServiceBusQueuedDate = policyRequest.LeadServiceBusQueuedDate == DateTime.MinValue ? createdDate : policyRequest.LeadServiceBusQueuedDate,
                        IsDeleted = false,
                        CreatedBy = RmaIdentity.Email,
                        CreatedDate = createdDate,
                        ModifiedBy = RmaIdentity.Email,
                        ModifiedDate = createdDate
                    };

                    _leadTimeTrackerRepository.Create(leadTimeTracker);
                }

                return await scope.SaveChangesAsync().ConfigureAwait(false) > 0;
            }
        }

        public async Task<bool> UpdateLeadTimeTrackerPolicyIdAsyn(string policyNumber, string leadClaimReference)
        {
            Contract.Requires(!string.IsNullOrEmpty(policyNumber));

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policy = await _policyRepository.FirstOrDefaultAsync(p => policyNumber == p.PolicyNumber);
                if (policy != null)
                {
                    var leadTimeTracker = await _leadTimeTrackerRepository.FirstOrDefaultAsync(x => x.LeadClaimReference == leadClaimReference);

                    if (leadTimeTracker != null)
                    {
                        leadTimeTracker.PolicyId = policy.PolicyId;
                        leadTimeTracker.ModifiedBy = RmaIdentity.Email;
                        leadTimeTracker.ModifiedDate = DateTimeHelper.SaNow;
                        _leadTimeTrackerRepository.Update(leadTimeTracker);
                    }
                }

                var results = await scope.SaveChangesAsync().ConfigureAwait(false);
                return results > 0;
            }
        }

        public async Task<bool> UpdateLeadTimeTrackerQlinkTransactionIdAsyn(List<int> policyIds)
        {
            Contract.Requires(policyIds != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                //We just want to know if the lead passed QADD/QANA
                var qlinktransactionTypes = new List<QLinkTransactionTypeEnum> { QLinkTransactionTypeEnum.QADD, QLinkTransactionTypeEnum.QANA };
                var leadTimeTrackers = await _leadTimeTrackerRepository.Where(x => policyIds.Contains(x.PolicyId.Value)).ToListAsync();
                var qlinkTransactions = await _qlinkTransactionRepository.Where(x => policyIds.Contains(x.ItemId) && qlinktransactionTypes.Contains(x.QLinkTransactionType))
                                        .OrderByDescending(g => g.QlinkTransactionId).ToListAsync();

                if (leadTimeTrackers != null)
                {
                    foreach (var policyId in policyIds)
                    {
                        var leadTimeTracker = leadTimeTrackers.FirstOrDefault(y => y.PolicyId == policyId);

                        if (leadTimeTracker == null)
                        {
                            continue;
                        }

                        var qlinkTransaction = qlinkTransactions.FirstOrDefault(y => y.ItemId == policyId
                                                && y.QLinkTransactionType == QLinkTransactionTypeEnum.QADD && y.StatusCode == qlinkSuccessfullStatusCode);

                        if (qlinkTransaction == null)
                        {
                            qlinkTransaction = qlinkTransactions.FirstOrDefault(y => y.ItemId == policyId
                                                && y.QLinkTransactionType == QLinkTransactionTypeEnum.QADD && y.StatusCode != qlinkSuccessfullStatusCode);
                        }

                        if (qlinkTransaction == null)
                        {
                            qlinkTransaction = qlinkTransactions.FirstOrDefault(y => y.ItemId == policyId
                                                && y.QLinkTransactionType == QLinkTransactionTypeEnum.QANA && y.StatusCode == qlinkSuccessfullStatusCode);
                        }

                        if (qlinkTransaction == null)
                        {
                            qlinkTransaction = qlinkTransactions.FirstOrDefault(y => y.ItemId == policyId
                                                && y.QLinkTransactionType == QLinkTransactionTypeEnum.QANA && y.StatusCode != qlinkSuccessfullStatusCode);
                        }

                        if (qlinkTransaction != null)
                        {
                            leadTimeTracker.QLinkTransactionId = qlinkTransaction.QlinkTransactionId;
                            leadTimeTracker.ModifiedDate = DateTimeHelper.SaNow;
                            leadTimeTracker.ModifiedBy = RmaIdentity.Username;
                            _leadTimeTrackerRepository.Update(leadTimeTracker);
                        }
                    }
                }

                var results = await scope.SaveChangesAsync().ConfigureAwait(false);
                return results > 0;
            }
        }

        public async Task<bool> UpdateLeadTimeTrackeWizardIdAsyn(int wizardId, string fileReference)
        {
            Contract.Requires(!string.IsNullOrEmpty(fileReference));
            Contract.Requires(wizardId > 0);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var leadTimeTracker = await _leadTimeTrackerRepository.FirstOrDefaultAsync(x => x.LeadClaimReference == fileReference);

                if (leadTimeTracker != null)
                {
                    leadTimeTracker.WizardId = wizardId;
                    leadTimeTracker.ModifiedBy = RmaIdentity.Email;
                    leadTimeTracker.ModifiedDate = DateTimeHelper.SaNow;
                    _leadTimeTrackerRepository.Update(leadTimeTracker);
                }

                var results = await scope.SaveChangesAsync().ConfigureAwait(false);
                return results > 0;
            }
        }
    }
}
