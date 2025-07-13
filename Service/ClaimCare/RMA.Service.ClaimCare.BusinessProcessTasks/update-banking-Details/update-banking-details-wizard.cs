using RMA.Common.Extensions;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Threading.Tasks;

using Informant = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.Informant;

namespace RMA.Service.ClaimCare.BusinessProcessTasks
{
    public class UpdateBankingDetailsWizard : IWizardProcess
    {
        private readonly IClaimService _claimService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IClaimService _claimCareService;

        public UpdateBankingDetailsWizard(
            IClaimService claimService,
            IRolePlayerService rolePlayerService,
            IClaimService claimCareService)
        {
            _claimService = claimService;
            _rolePlayerService = rolePlayerService;
            _claimCareService = claimCareService;
        }

        public async Task<int> StartWizard(IWizardContext context)
        {
            Contract.Requires(context != null);

            const string newBeneficiary = "Update Banking Details";
            var bankingModel = CreateClaimBeneficiaryBankingModel();

            if (context.LinkedItemId > 0)
            {
                bankingModel.RolePlayerBankingDetail = await _rolePlayerService.GetBankDetailByBankAccountId(context.LinkedItemId);
            }

            var stepData = new ArrayList { bankingModel };

            return await context.CreateWizard(newBeneficiary, stepData);
        }

        private static ClaimRolePlayerBankingModel CreateClaimBeneficiaryBankingModel()
        {
            return new ClaimRolePlayerBankingModel()
            {
                RolePlayer = new RolePlayer()
                {
                    Person = new Person(),
                    Informant = new Informant(),
                    HealthCareProvider = new HealthCareProviderModel(),
                    ForensicPathologist = new ForensicPathologist(),
                    FuneralParlor = new FuneralParlor(),
                    Undertaker = new Undertaker(),
                    BodyCollector = new BodyCollector(),
                    RolePlayerBankingDetails = new List<RolePlayerBankingDetail>()
                },
                RolePlayerBankingDetail = new RolePlayerBankingDetail()
                {
                    EffectiveDate = DateTimeHelper.SaNow,
                    CreatedDate = DateTimeHelper.SaNow,
                    ModifiedDate = DateTimeHelper.SaNow,
                    PurposeId = (int)BankingPurposeEnum.Payments
                }
            };
        }

        public async Task SubmitWizard(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var bankingModel = context.Deserialize<ClaimRolePlayerBankingModel>(stepData[0].ToString());

            // Populating the bank account model
            var bankAccount = bankingModel.RolePlayerBankingDetail;
            bankAccount.PurposeId = (int)BankingPurposeEnum.Payments;

            if (wizard.LinkedItemId > 0)
            {
                await _rolePlayerService.UpdateBankingDetails(bankAccount);
            }
            else
            {
                await _rolePlayerService.AddBankingDetails(bankAccount);
            }
        }

        public async Task<RuleRequestResult> ExecuteWizardRules(IWizardContext context)
        {
            Contract.Requires(context != null);
            var wizard = context.Deserialize<Wizard>(context.Data);
            var stepData = context.Deserialize<ArrayList>(wizard.Data);
            var bankingModel = context.Deserialize<ClaimRolePlayerBankingModel>(stepData[0].ToString());

            bool overallSuccess = true;
            var ruleResult = new RuleResult();
            var ruleResults = new List<RuleResult>();

            var ruleBankVerification = new RuleResult();
            if (bankingModel.IsVerified)
            {
                ruleBankVerification.Passed = true;
                ruleBankVerification.RuleName = "Bank Verification";

                var bankAccountVerificationRequestResult = await _claimCareService
                    .GetBankAccountVerificationDetails(bankingModel.RolePlayerBankingDetail.AccountNumber,
                        bankingModel.RolePlayerBankingDetail.BankAccountType,
                        bankingModel.RolePlayerBankingDetail.BranchCode);
                if (!bankAccountVerificationRequestResult.AccountSuccessfullyVerified )
                {
                    ruleBankVerification.Passed = false;
                    if (string.IsNullOrEmpty(bankAccountVerificationRequestResult.MessageDescription))
                        bankAccountVerificationRequestResult.MessageDescription = string.Empty;

                    ruleResult.MessageList.Add(bankAccountVerificationRequestResult.MessageDescription.Replace("\n", ", "));
                    overallSuccess = false;
                }
                else if (bankAccountVerificationRequestResult.MessageDescription.Contains("sent to the bank"))
                {
                    ruleResult.MessageList.Add("Account verification sent to the bank. Waiting for feedback");
                    overallSuccess = true;
                }
            }
            else
            {
                ruleBankVerification.Passed = false;
                ruleBankVerification.RuleName = "Bank Verification";
                ruleResult.MessageList.Add("Bank Verification Not Sent");
                overallSuccess = false;
            }

            ruleResults.Add(ruleResult);

            return await Task.FromResult(new RuleRequestResult()
            {
                OverallSuccess = overallSuccess,
                RequestId = Guid.NewGuid(),
                RuleResults = ruleResults
            });
        }

        public Task CancelWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task<int?> GetCustomApproverRole(IWizardContext context)
        {
            return Task.FromResult<int?>(null);
        }

        public async Task<string> ChangeTheNameWizard(string data, int wizardId, string currentWizardName)
        {
            return await Task.FromResult(string.Empty);
        }

        public Task UpdateStatus(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRejected(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnDispute(RejectWizardRequest rejectWizardRequest, IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnApprove(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnRequestForApproval(IWizardContext context)
        {
            return Task.CompletedTask;
        }

        public Task OnSaveStep(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public  Task OverrideWizard(IWizardContext context)
        {
            return Task.CompletedTask;
        }
        public Task OnSetApprovalStages(IWizardContext context)
        {
            return Task.CompletedTask;
        }
    }
}
