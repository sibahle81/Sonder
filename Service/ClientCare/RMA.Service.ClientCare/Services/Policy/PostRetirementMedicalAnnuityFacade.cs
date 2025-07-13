using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PostRetirementMedicalAnnuityFacade : RemotingStatelessService, IPostRetirementMedicalAnnuityService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_PostRetirementMedicalAnnuityInvoiceHeader> _postRetirementMedicalAnnuityInvoiceHeaderRepository;

        public PostRetirementMedicalAnnuityFacade(
           StatelessServiceContext context,
           IDbContextScopeFactory dbContextScopeFactory,
           IRepository<policy_PostRetirementMedicalAnnuityInvoiceHeader> postRetirementMedicalAnnuityInvoiceHeaderRepository

         ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _postRetirementMedicalAnnuityInvoiceHeaderRepository = postRetirementMedicalAnnuityInvoiceHeaderRepository;
        }

        public async Task<bool> ProcessPaymentResponse(int invoiceHeaderId, InvoiceStatusEnum invoiceStatus)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _postRetirementMedicalAnnuityInvoiceHeaderRepository.FindByIdAsync(invoiceHeaderId);
                if (entity != null)
                {
                    entity.InvoiceStatus = invoiceStatus;
                    entity.PaymentRequestedDate = DateTimeHelper.SaNow.Date;
                    _postRetirementMedicalAnnuityInvoiceHeaderRepository.Update(entity);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return true;
        }
    }
}
