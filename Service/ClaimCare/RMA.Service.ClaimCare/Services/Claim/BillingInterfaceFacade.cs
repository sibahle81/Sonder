using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Enums;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Entities;

using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class BillingInterfaceFacade : RemotingStatelessService, IBillingInterfaceService
    {
        private const string ClaimsModulePermissions = "ClaimsModulePermissions";
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        private readonly IRepository<claim_ClaimsRecovery> _claimsRecoveryRepository;
        private readonly IConfigurationService _configurationService;

        public BillingInterfaceFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<claim_ClaimsRecovery> claimsRecoveryRepository,
            IConfigurationService configurationService)
            : base(context)
        {
            this._dbContextScopeFactory = dbContextScopeFactory;
            _claimsRecoveryRepository = claimsRecoveryRepository;
            _configurationService = configurationService;
        }

        public async Task UpdateClaimRecoveryToRecovered(int claimRecoveryInvoiceId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.UpdateClaimRecovery);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var claimRecoveryEntity = await _claimsRecoveryRepository.Where(c => c.ClaimRecoveryInvoiceId == claimRecoveryInvoiceId).FirstOrDefaultAsync();

                if (claimRecoveryEntity != null)
                {
                    claimRecoveryEntity.ClaimStatus = ClaimStatusEnum.PaymentRecovered;
                    claimRecoveryEntity.WorkPool = WorkPoolEnum.IndividualAssessorpool;

                    _claimsRecoveryRepository.Update(claimRecoveryEntity);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
        }
    }
}