using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Contracts.Interfaces.Event;
using RMA.Service.ClaimCare.Database.Constants;
using RMA.Service.ClaimCare.Database.Entities;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;
using RMA.Service.DigiCare.Contracts.Interfaces.Digi;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class DiseaseFacade : RemotingStatelessService, IDiseaseService
    {
        private const string ClaimsModulePermissions = "ClaimsModulePermissions";
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IPolicyService _policyService;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IRepository<claim_ClaimBucketClass> _claimBucketClassRepository;
        private readonly IEventService _eventService;
        private readonly IConfigurationService _configurationService;
        private readonly IMedicalFormService _medicalFormService;
        private readonly IAccidentService _accidentService;
        private readonly IRepository<claim_MedicalReportFormWizardDetail> _medicalReportFormWizardDetails;
        private readonly IClaimService _claimService;
        private readonly ISLAService _slaService;

        public DiseaseFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_Claim> claimRepository
            , IRepository<claim_PersonEvent> personEventRepository
            , IPolicyService policyService
            , IRolePlayerService rolePlayerService
            , IDocumentIndexService documentIndexService
            , IRepository<claim_ClaimBucketClass> claimBucketClassRepository
            , IEventService eventService
            , IConfigurationService configurationService
            , IMedicalFormService medicalFormService
            , IAccidentService accidentService
            , IRepository<claim_MedicalReportFormWizardDetail> medicalReportFormWizardDetails
            , IClaimService claimService
            , ISLAService slaService
            ) :
            base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _claimRepository = claimRepository;
            _personEventRepository = personEventRepository;
            _policyService = policyService;
            _rolePlayerService = rolePlayerService;
            _documentIndexService = documentIndexService;
            _claimBucketClassRepository = claimBucketClassRepository;
            _eventService = eventService;
            _configurationService = configurationService;
            _medicalFormService = medicalFormService;
            _accidentService = accidentService;
            _medicalReportFormWizardDetails = medicalReportFormWizardDetails;
            _claimService = claimService;
            _slaService = slaService;
        }

        public async Task<Contracts.Entities.Claim> GetDiseaseClaim(int claimId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _claimRepository.FirstOrDefaultAsync(a => a.ClaimId == claimId);
                return Mapper.Map<Contracts.Entities.Claim>(entity);
            }
        }

        public async Task<string> GenerateClaimNumber(PersonEvent personEvent, DateTime eventDate, int count)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimNumber = string.Empty;
                var rolePlayer = await _rolePlayerService.GetCompany(personEvent.ClaimantId);

                var year = (eventDate.Year % 100).ToString().PadLeft(2, '0');

                claimNumber = $"X/{personEvent.PersonEventId}/{count}/{rolePlayer.FinPayee.FinPayeNumber}/{year}/PEV";
                return claimNumber;
            }
        }

        public async Task AutoAcknowledgeDiseaseClaim()
        {
            var diseaseClaims = await GetClaimsToAutoAcknowledgeByEventType(EventTypeEnum.Disease);

            foreach (var claim in diseaseClaims)
            {
                if (!claim.DocumentsBeenUploaded)
                {
                    continue;
                }

                // Run in the background, because will time out when called from the scheduler
                _ = Task.Run(() => ProcessAutoAcknowledgeSTPClaim(claim));
            }
        }

        public async Task SaveFirstMedicalReport(PersonEvent personEvent)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingFirstMedicalReport = await _medicalFormService.GetFirstMedicalReportByPersonEventId(personEvent.PersonEventId);

                if (personEvent?.FirstMedicalReport != null)
                {
                    var firstMedicalReportForm = await _accidentService.SetMedicalReportFields(personEvent);
                    var firstMedicalReport = await _medicalFormService.AddFirstMedicalReportForm(firstMedicalReportForm);

                    AddMedicalReportFormWizardDetail(new MedicalReportFormWizardDetail
                    {
                        WorkItemId = 0,
                        PersonEventId = personEvent.PersonEventId,
                        MedicalFormReportType = MedicalFormReportTypeEnum.FirstAccidentMedicalReport,
                        MedicalReportFormId = firstMedicalReport.MedicalReportForm.MedicalReportFormId,
                        DocumentId = firstMedicalReportForm.MedicalReportForm.DocumentId
                    });

                    await scope.SaveChangesAsync().ConfigureAwait(false);

                    if (existingFirstMedicalReport == null)
                    {
                        var slaStatusChangeAudit = new SlaStatusChangeAudit
                        {
                            SLAItemType = SLAItemTypeEnum.WorkPoolAcknowledgement,
                            ItemId = personEvent.PersonEventId,
                            EffectiveFrom = DateTimeHelper.SaNow,
                            EffictiveTo = null,
                            Reason = "First medical report was uploaded",
                            Status = personEvent.PersonEventStatus.ToString()
                        };

                        await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                    }
                }
            }
        }

        private void AddMedicalReportFormWizardDetail(MedicalReportFormWizardDetail medicalReportFormWizardDetail)
        {
            var medicalReportFormWizardDetailEntity = new claim_MedicalReportFormWizardDetail
            {
                WorkItemId = medicalReportFormWizardDetail.WorkItemId,
                WizardId = medicalReportFormWizardDetail.WizardId != null ? medicalReportFormWizardDetail.WizardId : null,
                MedicalFormReportType = medicalReportFormWizardDetail.MedicalFormReportType != null ? medicalReportFormWizardDetail.MedicalFormReportType : null,
                MedicalReportFormId = medicalReportFormWizardDetail.MedicalReportFormId != null ? medicalReportFormWizardDetail.MedicalReportFormId : null,
                PersonEventId = medicalReportFormWizardDetail.PersonEventId,
                DocumentId = medicalReportFormWizardDetail.DocumentId != null ? medicalReportFormWizardDetail.DocumentId : null,
                CreatedBy = RmaIdentity.Email,
                CreatedDate = DateTime.Now,
                ModifiedBy = RmaIdentity.Email,
                ModifiedDate = DateTime.Now
            };
            _medicalReportFormWizardDetails.Create(medicalReportFormWizardDetailEntity);
        }

        private async Task ProcessAutoAcknowledgeSTPClaim(AutoAjudicateClaim claim)
        {
            try
            {
                var policies = await _policyService.GetPoliciesWithProductOptionByRolePlayer(claim.ClaimantId);
                policies.RemoveAll(p => p.ProductCategoryType != ProductCategoryTypeEnum.Coid);

                if (claim.IdType == IdTypeEnum.PassportDocument || (claim.IdType == IdTypeEnum.SAIDDocument && claim.IsVopdVerified))
                {
                    await _claimService.AcknowledgeClaims(policies, claim.PersonEventId, true);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when processing auto acknowledge stp claim: {claim.PersonEventId} - Error Message {ex.Message}");
            }
        }

        private async Task<List<AutoAjudicateClaim>> GetClaimsToAutoAcknowledgeByEventType(EventTypeEnum eventType)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClaimsModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewEvent);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                SqlParameter[] parameters = { new SqlParameter("EventTypeId", (int)eventType) };

                return await _personEventRepository.SqlQueryAsync<AutoAjudicateClaim>(DatabaseConstants.GetClaimsToAutoAcknowledgeByEventType, parameters);
            }
        }
    }
}