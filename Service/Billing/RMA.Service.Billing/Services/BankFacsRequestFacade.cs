using Hyphen.FACS;

using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Utils;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.FinCare.Contracts.Entities.Integration;

using System;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace RMA.Service.Billing.Services
{
    public class BankFacsRequestFacade : RemotingStatelessService, IBankFacsRequestService
    {
        private const string BillingModulePermissions = "BillingModulePermissions";

        private readonly IRolePlayerService _rolePlayerService;
        private readonly IConfigurationService _configurationService;
        private readonly ITermsArrangementService _termsArrangementService;
        private readonly IHttpClientService _httpClientService;
        private readonly string _subscriptionKey;
        private readonly string _serviceEndpoint;

        private readonly string _profileName = "";

        public BankFacsRequestFacade(
            StatelessServiceContext context,
            IConfigurationService configurationService,
            IRolePlayerService rolePlayerService,
            ITermsArrangementService termsArrangementService,
            IHttpClientService httpClientService
            ) : base(context)
        {
            _rolePlayerService = rolePlayerService;
            _configurationService = configurationService;
            _serviceEndpoint = _configurationService.GetModuleSetting(SystemSettings.HyphenFacsRequestUrl).Result;
            _subscriptionKey = _configurationService.GetModuleSetting(SystemSettings.HyphenFacsRequestSubscriptionKey).Result;
            _termsArrangementService = termsArrangementService;
            _httpClientService = httpClientService;
        }

        private string GenerateHash()
        {
            var encrypt = new SHA256Managed();
            var hash = string.Empty;
            var content = _profileName + _subscriptionKey;
            var crypto = encrypt.ComputeHash(Encoding.UTF8.GetBytes(content), 0, Encoding.UTF8.GetByteCount(content));
            return crypto.Aggregate(hash, (current, theByte) => current + theByte.ToString("x2"));
        }

        public async Task<RootBankFACSConfirmation> SubmitCollection(Collection collection, BankAccount collectionAccount, int roleplayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ProcessBatchCollection);

            Contract.Requires(collection != null);
            Contract.Requires(collectionAccount != null);
            var payload = await GenerateJsonFromCollectionRequest(collection, collectionAccount, roleplayerId);

            var queryString = HttpUtility.ParseQueryString(string.Empty);

            // Request headers
            HttpClientSettings httpClientSettings = new HttpClientSettings();
            httpClientSettings.AddDefaultRequestHeader("Ocp-Apim-Subscription-Key", _subscriptionKey);

            var uri = _serviceEndpoint + queryString;

            // Request body
            var byteData = Encoding.UTF8.GetBytes(s: payload);

            using (var content = new ByteArrayContent(byteData))
            {
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var response = await _httpClientService.PostAsync(httpClientSettings, uri, content);

                var responseString = await response.Content.ReadAsStringAsync();
                var collectionResponse = JsonConvert.DeserializeObject<RootBankFACSConfirmation>(responseString);
                return collectionResponse;
            }
        }

        private async Task<string> GenerateJsonFromCollectionRequest(Collection collection, BankAccount collectionAccount, int roleplayerId)
        {
            var checksum = GenerateHash();

            var bankingDetails = new CollectionBankingDetail();
            if (collection.RolePlayerBankingId.HasValue && collection.CollectionsDebtorBankAccountSource == CollectionsDebtorBankAccountSourceEnum.ClientRoleplayerBanking)
            {
                var rolePlayerBankingDetail = await _rolePlayerService.GetBankDetailByBankAccountId(collection.RolePlayerBankingId.Value);
                bankingDetails.AccountNumber = rolePlayerBankingDetail.AccountNumber.Trim();
                bankingDetails.BankBranchId = rolePlayerBankingDetail.BankBranchId;
                bankingDetails.BankAccountType = rolePlayerBankingDetail.BankAccountType;
                bankingDetails.BranchCode = rolePlayerBankingDetail.BranchCode.Trim();
            }

            if (collection.TermArrangementScheduleId.HasValue && collection.CollectionsDebtorBankAccountSource == CollectionsDebtorBankAccountSourceEnum.BillingTermDebitOrderBanking)
            {
                var termsBankingDetail = await _termsArrangementService.GetTermsDebitOrderDetailsByTermSchedule(collection.TermArrangementScheduleId.Value);
                var rolePlayerBankingDetail = await _rolePlayerService.GetBankDetailByBankAccountId(termsBankingDetail.RolePlayerBankingId.Value);
                bankingDetails.AccountNumber = rolePlayerBankingDetail.AccountNumber.Trim();
                bankingDetails.BankBranchId = rolePlayerBankingDetail.BankBranchId;
                bankingDetails.BankAccountType = rolePlayerBankingDetail.BankAccountType;
                bankingDetails.BranchCode = rolePlayerBankingDetail.BranchCode.Trim();
            }
            var debtor = await _rolePlayerService.GetDisplayName(roleplayerId);
            var tranType = collectionAccount.TransactionType;

            var payload = new PayoutRequest()
            {
                bankFACSRequest =
                {
                    actionDate = collection.EffectiveDate !=null ? (collection.EffectiveDate.Value).ToString("yyyy-MM-dd"): DateTimeHelper.SaNow.AddDays(1).ToString("yyyy-MM-dd"),
                    amount = $"{Math.Round(collection.Amount, 2) * 100:0}",
                    bankAccountNumber = collectionAccount.AccountNumber,
                    checkSum = checksum,
                    clientBankAccountNumber = bankingDetails.AccountNumber,
                    clientBankAccountType = BankFacsUtils.ConvertToHyphenBankAccount(bankingDetails.BankAccountType).ToString(),
                    clientBranchCode = bankingDetails.BranchCode,
                    clientName = debtor,
                    code1 = "",
                    code2 = "",
                    transactionType = tranType, //collections account trans type
                    documentType = "DO", // debit order
                    reference1 = "DO", // debit order
                    fediIndicator = (int)fediIndicatorType.N,
                    processingOption1 = (int)processingOption1Type.I,
                    processingOption2 = (int)processingOption2Type.S,
                    reference2 = collection.BankReference
                }
            };

            if (payload.bankFACSRequest.reference2.Length > 20)
            {
                payload.bankFACSRequest.reference2 = payload.bankFACSRequest.reference2.Substring(0, 20);
            }

            return payload.ToJson();
        }
    }
}
