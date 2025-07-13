using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using PolicyModel = RMA.Service.ClientCare.Contracts.Entities.Policy.Policy;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PremiumListingPolicyPremiumMovementFacade : RemotingStatelessService, IPremiumListingPolicyPremiumMovementService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly ITransactionCreatorService _transactionCreatorService;
        private readonly IInvoiceAddService _invoiceAddService;
        private readonly IInvoiceService _invoiceService;
        private readonly IConfigurationService _configService;
        private readonly IRepository<Load_PremiumListingPolicyPremiumMovement> _policyPremiumMovementsRepository;
        private readonly IRepository<policy_Policy> _policyRepository;

        public PremiumListingPolicyPremiumMovementFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            ITransactionCreatorService transactionCreatorService,
            IInvoiceAddService invoiceAddService,
            IInvoiceService invoiceService,
            IConfigurationService configService,
            IRepository<Load_PremiumListingPolicyPremiumMovement> policyPremiumMovementsRepository,
            IRepository<policy_Policy> policyRepository
            ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _transactionCreatorService = transactionCreatorService;
            _invoiceAddService = invoiceAddService;
            _invoiceService = invoiceService;
            _configService = configService;
            _policyPremiumMovementsRepository = policyPremiumMovementsRepository;
            _policyRepository = policyRepository;
        }

        public async Task<bool> ProcessPremiumListingPolicyPremiumMovement()
        {
            var pendingPremiumListingPolicyPremiumMovements = new List<Load_PremiumListingPolicyPremiumMovement>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                pendingPremiumListingPolicyPremiumMovements = await _policyPremiumMovementsRepository
                  .Where(x => !x.IsProcessed)
                  .ToListAsync();
            }

            if (pendingPremiumListingPolicyPremiumMovements?.Count > 0)
            {
                var cutOffDay = await _configService.GetModuleSetting("PremiumListingUploadCutOffDay");

                foreach (var p in pendingPremiumListingPolicyPremiumMovements)
                {
                    try
                    {
                        if (p.CreatedDate.Day > int.Parse(cutOffDay))
                        {
                            await UpdatePremiumListingPolicyPremiumMovement(p.Id, $"Premium Listing uploaded after cut off Day: {cutOffDay}");
                            continue;
                        }

                        var checkdate = p.CreatedDate.AddMonths(1);

                        var nextMonthInvoice = await _transactionCreatorService.GetRaisedInvoiceByPolicyYearMonth(p.PolicyId, checkdate.Year, checkdate.Month);

                        if (nextMonthInvoice != null && (nextMonthInvoice.InvoiceStatus != InvoiceStatusEnum.Paid))
                        {
                            var policy = await GetPolicy(p.PolicyId);
                            var creditNoteTran = await _transactionCreatorService.CreateCreditNoteForInvoice(policy.PolicyOwnerId, nextMonthInvoice.TotalInvoiceAmount, "credit note for policy changes", nextMonthInvoice);

                            var invoiceId = await CreateInvoice(nextMonthInvoice, p.PolicyId, p.NewInstallmentPremium);
                            var invoiceTransaction = await _transactionCreatorService.CreateInvoiceTransaction(policy, invoiceId);

                            await UpdatePremiumListingPolicyPremiumMovement(p.Id, $"Next Month's Invoice ({nextMonthInvoice.InvoiceId}), Credited with  Credit Note ({creditNoteTran}), New Invoice Generated ({invoiceId})");
                        }
                    }
                    catch (Exception e)
                    {
                        e.LogException();
                    }
                }
            }
            return await Task.FromResult(true);
        }

        private async Task<PolicyModel> GetPolicy(int policyId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _policyRepository.FirstOrDefaultAsync(i => i.PolicyId == policyId);
                return Mapper.Map<PolicyModel>(policy);
            }
        }

        private async Task UpdatePremiumListingPolicyPremiumMovement(int id, string remarks)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var pendingPremiumMovement = await _policyPremiumMovementsRepository
                    .Where(x => x.Id == id)
                    .SingleAsync();

                if (pendingPremiumMovement?.Id > 0)
                {
                    pendingPremiumMovement.IsProcessed = true;
                    pendingPremiumMovement.Remarks = remarks;
                    pendingPremiumMovement.ModifiedBy = "BackEndProcess";
                    pendingPremiumMovement.ModifiedDate = DateTimeHelper.SaNow;

                    _policyPremiumMovementsRepository.Update(pendingPremiumMovement);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task<int> CreateInvoice(Invoice invoice, int policyId, decimal amount)
        {
            Contract.Requires(invoice != null);
            var newInvoice = new Invoice();
            newInvoice.PolicyId = policyId;
            newInvoice.CollectionDate = DateTimeHelper.SaNow;
            newInvoice.TotalInvoiceAmount = amount;
            newInvoice.InvoiceStatus = InvoiceStatusEnum.Pending;
            newInvoice.InvoiceNumber = string.Empty;
            newInvoice.InvoiceDate = invoice.InvoiceDate;
            if (await _configService.IsFeatureFlagSettingEnabled("RemoveInvoiceAddFacade"))
                return await _invoiceService.AddInvoiceItem(newInvoice);
            else
                return await _invoiceAddService.AddInvoiceItem(newInvoice);
        }
    }
}

