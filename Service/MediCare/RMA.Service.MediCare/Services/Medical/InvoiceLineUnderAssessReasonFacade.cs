using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Entities.Teba;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class InvoiceLineUnderAssessReasonFacade : RemotingStatelessService, IInvoiceLineUnderAssessReasonService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_InvoiceLineUnderAssessReason> _invoiceLineUnderAssessReasonRepository;

        public InvoiceLineUnderAssessReasonFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasonRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceLineUnderAssessReasonRepository = invoiceLineUnderAssessReasonRepository;
        }

        public async Task<int> AddInvoiceLineUnderAssessReason(InvoiceLineUnderAssessReason invoiceLineUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_InvoiceLineUnderAssessReason>(invoiceLineUnderAssessReason);
                _invoiceLineUnderAssessReasonRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }

        public async Task<List<InvoiceLineUnderAssessReason>> GetInvoiceLineUnderAssessReasonsByInvoiceLineId(int invoiceLineId, int tebaInvoiceLineId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                bool useMediInvoiceLineId = invoiceLineId > 0;
                return await _invoiceLineUnderAssessReasonRepository.Where(i =>
                (useMediInvoiceLineId && i.InvoiceLineId == invoiceLineId) ||
                    (!useMediInvoiceLineId && i.TebaInvoiceLineId == tebaInvoiceLineId)
                ).ProjectTo<InvoiceLineUnderAssessReason>().ToListAsync();
            }
        }

        public async Task<int> DeleteInvoiceLineUnderAssessReason(InvoiceLineUnderAssessReason invoiceLineUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _invoiceLineUnderAssessReasonRepository.FirstOrDefaultAsync(a => a.InvoiceLineId == invoiceLineUnderAssessReason.InvoiceLineId);

                entity.IsActive = false;
                entity.IsDeleted = true;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _invoiceLineUnderAssessReasonRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }
    }
}
