using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Entities.Teba;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class InvoiceUnderAssessReasonFacade : RemotingStatelessService, IInvoiceUnderAssessReasonService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_InvoiceUnderAssessReason> _invoiceUnderAssessReasonRepository;

        public InvoiceUnderAssessReasonFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_InvoiceUnderAssessReason> invoiceUnderAssessReasonRepository)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceUnderAssessReasonRepository = invoiceUnderAssessReasonRepository;
        }

        public async Task<int> AddInvoiceUnderAssessReason(InvoiceUnderAssessReason invoiceUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_InvoiceUnderAssessReason>(invoiceUnderAssessReason);
                _invoiceUnderAssessReasonRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task<List<InvoiceUnderAssessReason>> GetInvoiceUnderAssessReasonsByInvoiceId(int invoiceId, int tebaInvoiceId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var query = _invoiceUnderAssessReasonRepository.AsQueryable();

                if (invoiceId > 0)
                {
                    query = query.Where(i => i.InvoiceId == invoiceId);
                }
                else if (tebaInvoiceId > 0)
                {
                    query = query.Where(i => i.TebaInvoiceId == tebaInvoiceId);
                }

                return await query.ProjectTo<InvoiceUnderAssessReason>().ToListAsync();
            }
        }

        public async Task<int> DeleteInvoiceUnderAssessReason(InvoiceUnderAssessReason invoiceUnderAssessReason)
        {
            RmaIdentity.DemandPermission(Permissions.AddMedicalInvoice);
            Contract.Requires(invoiceUnderAssessReason != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var query = _invoiceUnderAssessReasonRepository.AsQueryable();

                if (invoiceUnderAssessReason.InvoiceId > 0)
                {
                    query = query.Where(i => i.InvoiceId == invoiceUnderAssessReason.InvoiceId);
                }
                else if (invoiceUnderAssessReason.TebaInvoiceId > 0)
                {
                    query = query.Where(i => i.TebaInvoiceId == invoiceUnderAssessReason.TebaInvoiceId);
                }

                var entity = await query.FirstOrDefaultAsync();

                entity.IsActive = false;
                entity.IsDeleted = true;
                entity.ModifiedBy = RmaIdentity.Email;
                entity.ModifiedDate = DateTimeHelper.SaNow;

                _invoiceUnderAssessReasonRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.Id;
            }
        }
    }
}
