using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;

using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Services

{
    public class StatementFacade : RemotingStatelessService, IStatementService
    {

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly ILetterOfGoodStandingService _letterOfGoodStandingService;
        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IBillingService _billingService;
        public StatementFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            ILetterOfGoodStandingService letterOfGoodStandingsService,
            IRepository<billing_Invoice> invoiceRepository,
            IBillingService billingService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _letterOfGoodStandingService = letterOfGoodStandingsService;
            _billingService = billingService;
            _invoiceRepository = invoiceRepository;
        }

        public async Task SendOutstandingLettersOfGoodStanding()
        {
            var invoices = await _invoiceRepository.Where(i => i.PendingThirtyDaysLog == true).ToListAsync();
            foreach (var invoice in invoices)
            {
                var expirationDate = invoice.InvoiceDate.AddMonths(1);
                await _letterOfGoodStandingService.GenerateLetterOfGoodStanding(expirationDate, invoice.Policy.PolicyPayeeId, invoice.PolicyId.Value);

                var text = $"letter of good standing expiring {expirationDate.ToString("yyyy-MM-dd")} sent to client";
                var note = new BillingNote
                {
                    ItemId = invoice.Policy.PolicyPayeeId,
                    ItemType = BillingNoteTypeEnum.LetterOfGoodStanding.GetDescription(),
                    Text = text
                };
                await _billingService.AddBillingNote(note);
            }
        }
    }
}

