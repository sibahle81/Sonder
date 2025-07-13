using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class InvoiceFacade : RemotingStatelessService, Contracts.Interfaces.Medical.IInvoiceService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<medical_Invoice> _invoiceRepository;
        private readonly IRepository<medical_InvoiceLine> _invoiceLineRepository;
        private readonly IRepository<medical_InvoiceUnderAssessReason> _invoiceUnderAssessReasonRepository;
        private readonly IRepository<medical_InvoiceLineUnderAssessReason> _invoiceLineUnderAssessReasonRepository;
        private readonly IRepository<medical_Tariff> _tariffRepository;
        private readonly IRepository<medical_MedicalItem> _medicalItemRepository;
        private readonly ISerializerService _serializerService;
        private readonly IWizardService _wizardService;
        public InvoiceFacade(StatelessServiceContext context
            , IDbContextScopeFactory dbContextScopeFactory
            , IRepository<medical_Invoice> invoiceRepository
            , IRepository<medical_InvoiceLine> invoiceLineRepository
            , IRepository<medical_InvoiceUnderAssessReason> invoiceUnderAssessReasonRepository
            , IRepository<medical_InvoiceLineUnderAssessReason> invoiceLineUnderAssessReasonRepository
            , IRepository<medical_Tariff> tariffRepository
            , IRepository<medical_MedicalItem> medicalItemRepository
            , ISerializerService serializerService
            , IWizardService wizardService
            )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
            _invoiceLineRepository = invoiceLineRepository;
            _invoiceUnderAssessReasonRepository = invoiceUnderAssessReasonRepository;
            _invoiceLineUnderAssessReasonRepository = invoiceLineUnderAssessReasonRepository;
            _tariffRepository = tariffRepository;
            _medicalItemRepository = medicalItemRepository;
            _serializerService = serializerService;
            _wizardService = wizardService;
        }

        public async Task<List<Invoice>> GetInvoices()
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceList = await _invoiceRepository
                    .ProjectTo<Invoice>()
                    .ToListAsync();

                foreach (var item in invoiceList)
                {
                    item.InvoiceLines = Mapper.Map<List<InvoiceLine>>(_invoiceLineRepository.Where(x => x.InvoiceId == item.InvoiceId).ToList());
                    if (item.InvoiceLines != null && item.InvoiceLines.Count > 0)
                    {
                        foreach (var invoiceLine in item.InvoiceLines)
                            invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());
                    }
                    item.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == item.InvoiceId).ToList());
                }

                return invoiceList;
            }
        }

        public async Task<Invoice> GetInvoice(int invoiceId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewMedicalInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entity = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

                var invoice = Mapper.Map<Invoice>(entity);

                if (invoice != null)
                {
                    invoice.InvoiceLines = Mapper.Map<List<InvoiceLine>>(_invoiceLineRepository.Where(x => x.InvoiceId == invoice.InvoiceId).ToList());
                    if (invoice.InvoiceLines != null && invoice.InvoiceLines.Count > 0)
                    {
                        foreach (var invoiceLine in invoice.InvoiceLines)
                            invoiceLine.InvoiceLineUnderAssessReasons = Mapper.Map<List<InvoiceLineUnderAssessReason>>(_invoiceLineUnderAssessReasonRepository.Where(x => x.InvoiceLineId == invoiceLine.InvoiceLineId).ToList());
                    }
                    invoice.InvoiceUnderAssessReasons = Mapper.Map<List<InvoiceUnderAssessReason>>(_invoiceUnderAssessReasonRepository.Where(x => x.InvoiceId == invoice.InvoiceId).ToList());
                }
                return invoice;
            }
        }

        public async Task<string> ValidateTariffCode(string itemCode, int practitionerTypeId, DateTime serviceDate)
        {
            bool isValid = false;

            using (var scope = _dbContextScopeFactory.CreateReadOnly())
            {
                if (!string.IsNullOrWhiteSpace(itemCode))
                {
                    var results = await (from mi in _medicalItemRepository
                                         join t in _tariffRepository on mi.MedicalItemId equals t.MedicalItemId
                                         where mi.ItemCode == itemCode && mi.IsActive.Equals(true)
                                         && t.PractitionerType == (PractitionerTypeEnum)practitionerTypeId
                                         && serviceDate >= t.ValidFrom && serviceDate <= t.ValidTo
                                         select mi).ToListAsync();

                    if (results.Count > 0)
                    {
                        isValid = true;
                    }
                }
            }
            return "{\"IsValidTariffCode\": \"" + isValid + "\"}";
        }

        public async Task<bool> MedicalInvoiceStatusUpdates(string procedureName)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                await _invoiceRepository.SqlQueryAsync<bool>(procedureName);
            }
            return true;
        }

        public async Task<bool> CreateAssessmentWizard(Invoice invoice)
        {
            Contract.Requires(invoice != null);
            var data = _serializerService.Serialize(invoice);
            var assessmentWizard = new StartWizardRequest()
            {
                Data = data,
                Type = "medical-invoice-assessment",
                LinkedItemId = invoice.InvoiceId,
                LockedToUser = null,
                RequestInitiatedByBackgroundProcess = true
            };

           await _wizardService.StartWizard(assessmentWizard);
          return await Task.FromResult(true);
        }
    }
}
