using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;
using TebaInvoice = RMA.Service.MediCare.Contracts.Entities.Medical.TebaInvoice;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class UnderAssessReasonFacade : RemotingStatelessService, IUnderAssessReasonService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_UnderAssessReason> _underAssessReasonRepository;
        private readonly IInvoiceCommonService _invoiceCommonService;
        private readonly IInvoiceUnderAssessReasonService _invoiceUnderAssessReasonService;
        private readonly IMapper _mapper;

        public UnderAssessReasonFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IInvoiceCommonService invoiceCommonService
            , IInvoiceUnderAssessReasonService invoiceUnderAssessReasonService
            , IRepository<common_UnderAssessReason> underAssessReasonRepository,
              IMapper mapper)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _underAssessReasonRepository = underAssessReasonRepository;
            _invoiceCommonService = invoiceCommonService;
            _invoiceUnderAssessReasonService = invoiceUnderAssessReasonService;
            _mapper = mapper;
        }

        public async Task<List<UnderAssessReason>> GetUnderAssessReasons()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                return await _underAssessReasonRepository
                    .Where(u => u.IsActive && !u.IsDeleted)
                    .OrderBy(u => u.Description)
                    .ProjectTo<UnderAssessReason>(_mapper.ConfigurationProvider)
                    .ToListAsync();
            }
        }

        public async Task<List<UnderAssessReason>> GetLineUnderAssessReasons()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var lineUnderAssessReasons = await _underAssessReasonRepository
                    .Where(u => u.IsActive && !u.IsDeleted && u.IsLineItemReason)
                    .OrderBy(u => u.Description)
                    .ToListAsync();
                return _mapper.Map<List<UnderAssessReason>>(lineUnderAssessReasons);
            }
        }

        public async Task<UnderAssessReason> GetUnderAssessReason(int underAssessReasonId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var underAssessReason = await _underAssessReasonRepository.Where(i => i.UnderAssessReasonId == underAssessReasonId).FirstOrDefaultAsync();

                return _mapper.Map<UnderAssessReason>(underAssessReason);
            }
        }

        public async Task<List<UnderAssessReason>> GetUnderAssessReasonsByInvoiceStatus(InvoiceStatusEnum invoiceStatus)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var underAssessReasons = await _underAssessReasonRepository
                    .Where(u => u.IsActive && !u.IsDeleted && u.InvoiceStatus == invoiceStatus)
                    .OrderBy(u => u.Description)
                    .ToListAsync();
                return _mapper.Map<List<UnderAssessReason>>(underAssessReasons);
            }
        }

        public async Task<int> SetInvoiceUnderAssessReason(UnderAssessReason underAssessReason)
        {
            Contract.Requires(underAssessReason != null);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var existingInvoiceUnderAssessReasons = await _invoiceUnderAssessReasonService.GetInvoiceUnderAssessReasonsByInvoiceId(underAssessReason.InvoiceId ?? 0, underAssessReason.TebaInvoiceId ?? 0);
                var checkIfContains = existingInvoiceUnderAssessReasons.Exists(val => val.UnderAssessReasonId == underAssessReason.UnderAssessReasonId);
                InvoiceDetails invoiceDetails;
                TebaInvoice tebaInvoice;

                if (!checkIfContains)
                {
                    InvoiceUnderAssessReason underAssessReasonData = new InvoiceUnderAssessReason()
                    {
                        UnderAssessReasonId = underAssessReason.UnderAssessReasonId,
                        UnderAssessReason = underAssessReason.UnderAssessReasonText,
                        Comments = underAssessReason.Comments,
                        InvoiceStatus = underAssessReason.InvoiceStatus
                    };

                    switch (underAssessReason.InvoiceType)
                    {
                        case InvoiceTypeEnum.Medical:
                            underAssessReasonData.InvoiceId = underAssessReason.InvoiceId;
                            invoiceDetails = await _invoiceCommonService.GetInvoiceDetails((int)underAssessReason.InvoiceId);
                            invoiceDetails.InvoiceStatus = underAssessReason.InvoiceStatus;
                            await _invoiceCommonService.EditInvoiceStatus(invoiceDetails);
                            break;
                        case InvoiceTypeEnum.Teba:
                            underAssessReasonData.TebaInvoiceId = underAssessReason.InvoiceId;
                            tebaInvoice = await _invoiceCommonService.GetTebaInvoice((int)underAssessReason.TebaInvoiceId);
                            tebaInvoice.InvoiceStatus = underAssessReason.InvoiceStatus;
                            await _invoiceCommonService.EditTebaInvoiceStatus(tebaInvoice);
                            break;
                    }

                    await _invoiceUnderAssessReasonService.AddInvoiceUnderAssessReason(underAssessReasonData);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                }
            }
            return (int)underAssessReason.InvoiceId;
        }

    }
}
