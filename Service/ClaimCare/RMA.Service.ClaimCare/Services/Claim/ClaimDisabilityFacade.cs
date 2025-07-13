using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClaimCare.Contracts.Interfaces.Claim;
using RMA.Service.ClaimCare.Database.Entities;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Services.Claim
{
    public class ClaimDisabilityFacade : RemotingStatelessService, IClaimDisabilityService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        private readonly IRepository<claim_PersonEvent> _personEventRepository;
        private readonly IRepository<claim_Claim> _claimRepository;
        private readonly IRepository<claim_ClaimDisabilityAssessment> _claimDisabilityAssessmentRepository;
        private readonly IRepository<claim_ClaimDisabilityPension> _claimDisabilityPensionRepository;
        private readonly IRepository<claim_HearingAssessment> _claimHearingAssessmentRepository;

        public ClaimDisabilityFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<claim_PersonEvent> personEventRepository
            , IRepository<claim_Claim> claimRepository
            , IRepository<claim_ClaimDisabilityAssessment> claimDisabilityAssessmentRepository
            , IRepository<claim_ClaimDisabilityPension> claimDisabilityPensionRepository
            , IRepository<claim_HearingAssessment> claimHearingAssessmentRepository) :
            base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _personEventRepository = personEventRepository;
            _claimRepository = claimRepository;
            _claimDisabilityAssessmentRepository = claimDisabilityAssessmentRepository;
            _claimDisabilityPensionRepository = claimDisabilityPensionRepository;
            _claimHearingAssessmentRepository = claimHearingAssessmentRepository;
        }

        #region Public Methods

        public async Task<int> AddClaimDisabilityPension(ClaimDisabilityPension claimDisabilityPension)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                Contract.Requires(claimDisabilityPension != null);

                var entity = Mapper.Map<claim_ClaimDisabilityPension>(claimDisabilityPension);

                _claimDisabilityPensionRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.DisabilityPensionId;
            }
        }

        public async Task<bool> UpdateClaimDisabilityPension(ClaimDisabilityPension claimDisabilityPension)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<claim_ClaimDisabilityPension>(claimDisabilityPension);

                _claimDisabilityPensionRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                return true;
            }
        }

        public async Task<ClaimDisabilityPension> GetClaimDisabilityPensionByPersonEventId(int personEventId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var claimDisabilityPension = await _claimDisabilityPensionRepository.FirstOrDefaultAsync(d => d.PersonEventId == personEventId);
                return Mapper.Map<ClaimDisabilityPension>(claimDisabilityPension);
            }
        }

        public async Task<PagedRequestResult<ClaimDisabilityAssessmentResult>> GetPagedClaimDisabilityAssessmentsHistory(PagedRequest pagedRequest, int personEventId)
        {
            Contract.Requires(pagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(i => i.PersonEventId == personEventId);

                var claimAssessments = await (from pe in _personEventRepository
                                              join clm in _claimRepository on pe.PersonEventId equals clm.PersonEventId
                                              join ca in _claimDisabilityAssessmentRepository on pe.PersonEventId equals ca.PersonEventId
                                              where pe.InsuredLifeId == personEvent.InsuredLifeId
                                              select new ClaimDisabilityAssessmentResult
                                              {
                                                     ClaimDisabilityAssessmentId = ca.ClaimDisabilityAssessmentId
                                                    ,PersonEventId = ca.PersonEventId
                                                    ,FinalDiagnosis = ca.FinalDiagnosis
                                                    ,RawPdPercentage = ca.RawPdPercentage
                                                    ,NettAssessedPdPercentage = ca.NettAssessedPdPercentage
                                                    ,AssessedBy = ca.AssessedBy
                                                    ,AssessmentDate = ca.AssessmentDate
                                                    ,IsDeleted = ca.IsDeleted
                                                    ,CreatedBy = ca.CreatedBy
                                                    ,CreatedDate = ca.CreatedDate
                                                    ,ModifiedBy = ca.ModifiedBy
                                                    ,ModifiedDate = ca.ModifiedDate
                                                    ,DisabilityAssessmentStatus = ca.DisabilityAssessmentStatus
                                                    ,ClaimId = ca.ClaimId
                                                    ,ClaimReferenceNumber = clm.ClaimReferenceNumber
                                                    ,IsAuthorised = ca.IsAuthorised
                                                    ,MedicalReportFormId = ca.MedicalReportFormId
                                              })
                                            .ToPagedResult(pagedRequest);

                var result = Mapper.Map<List<ClaimDisabilityAssessmentResult>>(claimAssessments.Data);

                return new PagedRequestResult<ClaimDisabilityAssessmentResult>
                {
                    Page = pagedRequest.Page,
                    PageCount = pagedRequest.PageSize,
                    RowCount = claimAssessments.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result
                };
            }
        }

        public async Task<PagedRequestResult<ClaimHearingAssessment>> GetPagedClaimHearingAssessment(PagedRequest pagedRequest, int personEventId)
        {
            Contract.Requires(pagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var personEvent = await _personEventRepository.FirstOrDefaultAsync(i => i.PersonEventId == personEventId);
                var hearingAssessments = await (from pe in _personEventRepository
                                              join ch in _claimHearingAssessmentRepository on pe.PersonEventId equals ch.PersonEventId
                                              where pe.InsuredLifeId == personEvent.InsuredLifeId
                                              select ch)
                                            .ToPagedResult(pagedRequest);

                await _claimHearingAssessmentRepository.LoadAsync(hearingAssessments.Data, c => c.AudioGramItems);

                var result = Mapper.Map<List<ClaimHearingAssessment>>(hearingAssessments.Data);

                return new PagedRequestResult<ClaimHearingAssessment>
                {
                    Page = pagedRequest.Page,
                    PageCount = pagedRequest.PageSize,
                    RowCount = hearingAssessments.RowCount,
                    PageSize = pagedRequest.PageSize,
                    Data = result
                };
            }
        }

        #endregion
    }
}


