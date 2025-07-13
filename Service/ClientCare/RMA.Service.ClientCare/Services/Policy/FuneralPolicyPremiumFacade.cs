using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;

using System.Data.SqlClient;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class FuneralPolicyPremiumFacade : RemotingStatelessService, IFuneralPolicyPremiumService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_Policy> _policyRepository;
        private readonly IConfigurationService _configurationService;
        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        public FuneralPolicyPremiumFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<policy_Policy> policyRepository,
            IConfigurationService configurationService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _policyRepository = policyRepository;
            _configurationService = configurationService;
        }

        public async Task<FuneralPolicyPremium> GetIndividualPolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPremium);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var premium = await _policyRepository
                    .SqlQueryAsync<FuneralPolicyPremium>(
                        "[policy].[GetIndividualPolicyPremium] @baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage, @premiumAdjustmentPercentage",
                        new SqlParameter { ParameterName = "@baseRate", Value = baseRate },
                        new SqlParameter { ParameterName = "@adminPercentage", Value = adminPercentage },
                        new SqlParameter { ParameterName = "@commissionPercentage", Value = commissionPercentage },
                        new SqlParameter { ParameterName = "@binderFeePercentage", Value = binderFeePercentage },
                        new SqlParameter { ParameterName = "@premiumAdjustmentPercentage", Value = premiumAdjustmentPercentage }
                    );
                return premium[0];
            }
        }

        public async Task<FuneralPolicyPremium> GetGroupPolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPremium);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var premium = await _policyRepository
                    .SqlQueryAsync<FuneralPolicyPremium>(
                        "[policy].[GetGroupPolicyPremium] @baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage, @premiumAdjustmentPercentage",
                        new SqlParameter { ParameterName = "@baseRate", Value = baseRate },
                        new SqlParameter { ParameterName = "@adminPercentage", Value = adminPercentage },
                        new SqlParameter { ParameterName = "@commissionPercentage", Value = commissionPercentage },
                        new SqlParameter { ParameterName = "@binderFeePercentage", Value = binderFeePercentage },
                        new SqlParameter { ParameterName = "@premiumAdjustmentPercentage", Value = premiumAdjustmentPercentage }
                    );
                return premium[0];
            }
        }

        public async Task<FuneralPolicyPremium> GetGroupSchemePolicyPremium(decimal baseRate, decimal adminPercentage, decimal commissionPercentage, decimal binderFeePercentage, decimal premiumAdjustmentPercentage)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewPremium);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var premium = await _policyRepository
                    .SqlQueryAsync<FuneralPolicyPremium>(
                        "[policy].[GetGroupSchemePolicyPremium] @baseRate, @adminPercentage, @commissionPercentage, @binderFeePercentage, @premiumAdjustmentPercentage",
                        new SqlParameter { ParameterName = "@baseRate", Value = baseRate },
                        new SqlParameter { ParameterName = "@adminPercentage", Value = adminPercentage },
                        new SqlParameter { ParameterName = "@commissionPercentage", Value = commissionPercentage },
                        new SqlParameter { ParameterName = "@binderFeePercentage", Value = binderFeePercentage },
                        new SqlParameter { ParameterName = "@premiumAdjustmentPercentage", Value = premiumAdjustmentPercentage }
                    );
                return premium[0];
            }
        }
    }
}
