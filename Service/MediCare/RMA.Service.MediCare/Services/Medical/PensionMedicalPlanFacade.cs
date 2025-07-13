using AutoMapper;
using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;
using System.Collections.Generic;
using System.Data.Entity;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class PensionMedicalPlanFacade : RemotingStatelessService, IPensionMedicalPlanService
    {

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_Invoice> _invoiceRepository;
        private readonly IRepository<medical_InvoiceLine> _invoiceLineRepository;
        private readonly IRepository<medical_InvoiceUnderAssessReason> _invoiceUnderAssessReasonRepository;
        private readonly IRepository<medical_InvoiceLineUnderAssessReason> _invoiceLineUnderAssessReasonRepository;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_PmpRegionTransfer> _pmpRegionTransferRepository;
        private readonly IRepository<medical_PensionerInterviewFormDetail> _pensionerInterviewFormDetailRepository;
        private readonly IRepository<medical_PensionerInterviewForm> _pensionerInterviewFormRepository;

        public PensionMedicalPlanFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_Invoice> invoiceRepository
            , IRepository<medical_InvoiceLine> invoiceLineRepository
            , IRepository<medical_InvoiceUnderAssessReason> invoiceUnderAssessReasonRepository
            , IRepository<medical_InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasonRepository
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_PmpRegionTransfer> pmpRegionTransferRepository
            , IRepository<medical_PensionerInterviewFormDetail> pensionerInterviewFormDetailRepository
            , IRepository<medical_PensionerInterviewForm> pensionerInterviewFormRepository
            )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
            _invoiceLineRepository = invoiceLineRepository;
            _invoiceUnderAssessReasonRepository = invoiceUnderAssessReasonRepository;
            _invoiceLineUnderAssessReasonRepository = invoiceLineUnderAssessReasonRepository;
            _tariffRepository = tariffRepository;
            _pmpRegionTransferRepository = pmpRegionTransferRepository;
            _pensionerInterviewFormDetailRepository = pensionerInterviewFormDetailRepository;
            _pensionerInterviewFormRepository = pensionerInterviewFormRepository;
        }

        public async Task<int> CreatePmpRegionTransfer(PmpRegionTransfer pmpRegionTransfer)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_PmpRegionTransfer>(pmpRegionTransfer);
                _pmpRegionTransferRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.PmpRegionTransferId;
            }
        }

        public async Task<PmpRegionTransfer> GetPmpRegionTransfer(int pmpRegionTransferId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _pmpRegionTransferRepository.FirstOrDefaultAsync(d => d.PmpRegionTransferId == pmpRegionTransferId);
                return Mapper.Map<PmpRegionTransfer>(entity);
            }
        }

        public async Task<List<PmpRegionTransfer>> GetPmpRegionTransferByClaimId(int claimId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _pmpRegionTransferRepository.Where(d => d.ClaimId == claimId).ToListAsync();
                await _pmpRegionTransferRepository.LoadAsync(entity, t => t.HealthCareProvider);
                return Mapper.Map<List<PmpRegionTransfer>>(entity);
            }
        }

        public async Task<int> CreatePensionerInterviewFormDetail(PensionerInterviewForm pensionerInterviewForm)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_PensionerInterviewForm>(pensionerInterviewForm);
                _pensionerInterviewFormRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.PensionerInterviewFormId;
            }
        }

        public async Task<PensionerInterviewForm> GetPensionerInterviewFormDetailById(int pensionerInterviewFormId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _pensionerInterviewFormRepository.FirstOrDefaultAsync(d => d.PensionerInterviewFormId == pensionerInterviewFormId);
                return Mapper.Map<PensionerInterviewForm>(entity);
            }
        }

        public async Task<List<PensionerInterviewForm>> GetPensionerInterviewFormByPensionerId(int pensionerId)
        {
            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _pensionerInterviewFormRepository.Where(d => d.PensionerId == pensionerId).ToListAsync();
                await _pensionerInterviewFormRepository.LoadAsync(entity, t => t.PensionerInterviewFormDetails);
                return Mapper.Map<List<PensionerInterviewForm>>(entity);
            }
        }

        public async Task<int> UpdatePmpRegionTransfer(PmpRegionTransfer pmpRegionTransfer)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_PmpRegionTransfer>(pmpRegionTransfer);
                _pmpRegionTransferRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.PmpRegionTransferId;
            }
        }

        public async Task<int> UpdatePensionerInterviewForm(PensionerInterviewForm pensionerInterviewForm)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<medical_PensionerInterviewForm>(pensionerInterviewForm);
                _pensionerInterviewFormRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.PensionerInterviewFormId;
            }
        }
    }
}
