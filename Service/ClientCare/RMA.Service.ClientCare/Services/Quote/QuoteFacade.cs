using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Entities;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Quote;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Member;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.Quote;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using LeadModel = RMA.Service.ClientCare.Contracts.Entities.Lead.Lead;
using QuoteModel = RMA.Service.ClientCare.Contracts.Entities.Quote.Quote;

namespace RMA.Service.ClientCare.Services.Quote
{
    public class QuoteFacade : RemotingStatelessService, IQuoteService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<lead_Company> _leadCompanyRepository;
        private readonly ILeadCommunicationService _leadCommunicationService;
        private readonly IRepository<common_OneTimePin> _oneTimePinRepository;
        private readonly IRepository<lead_Lead> _leadRepository;
        private readonly IConfigurationService _configurationService;
        private readonly IMemberService _memberService;
        private readonly IProductOptionService _productOptionService;

        private readonly IRepository<quote_QuoteV2> _quoteV2Repository;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IWizardService _wizardService;
        private readonly ISerializerService _serializerService;
        private readonly ISLAService _slaService;
        private readonly ILeadService _leadService;


        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        public QuoteFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            ILeadCommunicationService leadCommunicationService,
            IRepository<common_OneTimePin> oneTimePinRepository,
            IRepository<lead_Lead> leadRepository,
            IRepository<lead_Company> companyRepository,
            IConfigurationService configurationService,
            IMemberService memberService,
            IRepository<quote_QuoteV2> quoteV2Repository,
            IDocumentGeneratorService documentGeneratorService,
            IWizardService wizardService,
            ISerializerService serializerService,
            ISLAService slaService,
            ILeadService leadService,
            IProductOptionService productOptionService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _leadCommunicationService = leadCommunicationService;
            _leadCompanyRepository = companyRepository;
            _oneTimePinRepository = oneTimePinRepository;
            _leadRepository = leadRepository;
            _configurationService = configurationService;
            _memberService = memberService;

            _quoteV2Repository = quoteV2Repository;
            _documentGeneratorService = documentGeneratorService;
            _wizardService = wizardService;
            _serializerService = serializerService;
            _slaService = slaService;
            _leadService = leadService;
            _productOptionService = productOptionService;
        }

        public async Task<QuoteModel> GetQuoteByQuoteNumber(string quoteNumber, int oneTimePin)
        {
            //int quoteId = 0;
            //var quoteModel = new QuoteModel();
            //var result = new QuoteModel();
            //try
            //{
            //    using (_dbContextScopeFactory.CreateReadOnly())
            //    {
            //        var entity = await _quoteRepository.SingleAsync(s => s.QuoteNumber == quoteNumber, $"Error fetching quote details: {quoteNumber}");
            //        if (entity != null) quoteId = entity.QuoteId;

            //        await _quoteRepository.LoadAsync(entity, d => d.LeadProducts);
            //        await _quoteRepository.LoadAsync(entity, t => t.QuoteAllowances);

            //        quoteModel = Mapper.Map<QuoteModel>(entity);

            //        var leadProduct = await _leadProductRepository.FirstOrDefaultAsync(s => s.QuoteId == quoteId);
            //        if (leadProduct != null)
            //        {
            //            quoteModel.ProductId = Convert.ToInt32(leadProduct.ProductId);
            //            quoteModel.ProductOptionId = Convert.ToInt32(leadProduct.ProductOptionId);

            //            var product = await _productService.GetProduct(leadProduct.ProductId);
            //            quoteModel.ProductClass = product.ProductClass;
            //        }
            //        else
            //        {
            //            throw new BusinessException($"Error fetching quote details: {quoteNumber}");
            //        }
            //    }

            //    if (quoteId > 0 && await ValidateOneTimePin(quoteId, oneTimePin))
            //    {
            //        result = quoteModel;
            //    }
            //    else
            //    {
            //        throw new BusinessException("New One Time Pin Required");
            //    }
            //}
            //catch (Exception e)
            //{
            //    e.LogException();
            //}

            //return result;
            return null;
        }

        private async Task<bool> ValidateOneTimePin(int itemId, int oneTimePin)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var oneTimePinRepository = await _oneTimePinRepository
                    .Where(o => o.ItemId == itemId && o.OneTimePin == oneTimePin)
                    .FirstOrDefaultAsync();

                if (oneTimePinRepository == null) return await Task.FromResult(false);

                if ((DateTime.Now.ToSaDateTime() - oneTimePinRepository.CreatedDate).TotalMinutes > 5)
                    oneTimePinRepository.IsDeleted = true;

                _oneTimePinRepository.Update(oneTimePinRepository);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
            return await Task.FromResult(true);
        }

        public async Task<OneTimePinModel> GetOneTimePinByQuoteNumber(string quoteNumber)
        {
            //var oneTimePin = CommonUtil.GenerateRandomNumber(11111, 99999, 5);
            //var quoteModel = new QuoteModel();

            //var quoteVerificationModel = new OneTimePinModel()
            //{
            //    Status = 100,
            //    QuoteNumber = quoteNumber
            //};

            //try
            //{
            //    using (_dbContextScopeFactory.CreateReadOnly())
            //    {
            //        var entity = await _quoteRepository
            //            .SingleAsync(s => s.QuoteNumber == quoteNumber, $"Error Generating One Time Pin: {quoteNumber}");

            //        await _quoteRepository.LoadAsync(entity, d => d.LeadProducts);

            //        quoteModel = Mapper.Map<QuoteModel>(entity);
            //    }

            //    if (quoteModel != null)
            //    {
            //        bool oneTimePinSent = false;
            //        var lead = await GetLeadByQuoteId(quoteModel.QuoteId);
            //        foreach (var contact in lead.Contacts)
            //        {
            //            if (contact.CommunicationType == CommunicationTypeEnum.SMS)
            //            {
            //                if (contact.CommunicationTypeValue.Length > 9)
            //                {
            //                    oneTimePinSent = await _leadCommunicationService.SendOneTimePin("Quote", quoteModel.QuoteId, contact.CommunicationTypeValue, oneTimePin);

            //                    if (oneTimePinSent)
            //                    {
            //                        using (var scope = _dbContextScopeFactory.Create())
            //                        {
            //                            var oneTimePinRepository = new common_OneTimePin()
            //                            {
            //                                OneTimePin = oneTimePin,
            //                                ItemType = "Quote",
            //                                ItemId = quoteModel.QuoteId,
            //                                CellPhoneNumber = contact.CommunicationTypeValue
            //                            };

            //                            _oneTimePinRepository.Create(oneTimePinRepository);
            //                            await scope.SaveChangesAsync().ConfigureAwait(false);
            //                        }
            //                    }
            //                }
            //                quoteVerificationModel.Status = 200;
            //                quoteVerificationModel.Message = oneTimePinSent ? $"OTP sent to number ending ** {contact.CommunicationTypeValue.Substring(contact.CommunicationTypeValue.Length - 2)}" : "Error Sending One Time Pin";
            //            }
            //        }


            //    }
            //}
            //catch (Exception e)
            //{
            //    quoteVerificationModel.Message = "Error Generating One Time Pin";
            //    e.LogException();
            //}

            //return quoteVerificationModel
            return null;
        }

        public async Task<LeadModel> GetLeadByQuoteId(int quoteId)
        {
            //if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            //    RmaIdentity.DemandPermission(Permissions.ViewLead);

            //using (_dbContextScopeFactory.CreateReadOnly())
            //{
            //    var leadProduct = await _leadProductRepository.FirstOrDefaultAsync(s => s.QuoteId == quoteId);
            //    return await GetLeadDetails(leadProduct.LeadId);
            //}
            return null;
        }

        public async Task<LeadModel> GetLeadDetails(int id)
        {
            //if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
            //    RmaIdentity.DemandPermission(Permissions.ViewLead);

            //using (_dbContextScopeFactory.CreateReadOnly())
            //{
            //    var leadEntity = await _leadRepository.FirstOrDefaultAsync(s => s.LeadId == id);
            //    await _leadRepository.LoadAsync(leadEntity, t => t.LeadProducts);
            //    await _leadRepository.LoadAsync(leadEntity, t => t.Contacts);

            //    await _leadProductRepository.LoadAsync(leadEntity.LeadProducts, t => t.Quote);

            //    var lead = Mapper.Map<LeadModel>(leadEntity);

            //    return lead;
            //}

            return null;
        }

        public async Task<OneTimePinModel> GetOneTimePinByQuoteNumberViaEmail(string quoteNumber)
        {
            //var oneTimePin = CommonUtil.GenerateRandomNumber(11111, 99999, 5);
            //var quoteModel = new QuoteModel();

            //var quoteVerificationModel = new OneTimePinModel()
            //{
            //    Status = 100,
            //    QuoteNumber = quoteNumber
            //};

            //try
            //{
            //    using (_dbContextScopeFactory.CreateReadOnly())
            //    {
            //        var entity = await _quoteRepository
            //            .SingleAsync(s => s.QuoteNumber == quoteNumber, $"Error Generating One Time Pin: {quoteNumber}");

            //        await _quoteRepository.LoadAsync(entity, d => d.LeadProducts);

            //        quoteModel = Mapper.Map<QuoteModel>(entity);
            //    }

            //    if (quoteModel != null)
            //    {
            //        bool oneTimePinSent = false;
            //        var lead = await GetLeadByQuoteId(quoteModel.QuoteId);
            //        foreach (var contact in lead.Contacts)
            //        {
            //            if (contact.CommunicationType == CommunicationTypeEnum.Email)
            //            {
            //                if (contact.CommunicationTypeValue.Length > 9)
            //                {
            //                    oneTimePinSent = await _leadCommunicationService.SendOneTimePinViaEmail("Quote", quoteModel.QuoteId, contact.CommunicationTypeValue, oneTimePin);

            //                    if (oneTimePinSent)
            //                    {
            //                        using (var scope = _dbContextScopeFactory.Create())
            //                        {
            //                            var oneTimePinRepository = new common_OneTimePin()
            //                            {
            //                                OneTimePin = oneTimePin,
            //                                ItemType = "Quote",
            //                                ItemId = quoteModel.QuoteId,
            //                                CellPhoneNumber = contact.CommunicationTypeValue
            //                            };

            //                            _oneTimePinRepository.Create(oneTimePinRepository);
            //                            await scope.SaveChangesAsync().ConfigureAwait(false);
            //                        }
            //                    }
            //                }
            //                quoteVerificationModel.Status = 200;
            //                quoteVerificationModel.Message = oneTimePinSent ? $"OTP sent to email ending ** {contact.CommunicationTypeValue.Substring(contact.CommunicationTypeValue.Length - 2)}" : "Error Sending One Time Pin";
            //            }
            //        }


            //    }
            //}
            //catch (Exception e)
            //{
            //    quoteVerificationModel.Message = "Error Generating One Time Pin";
            //    e.LogException();
            //}

            //return quoteVerificationModel;
            return null;
        }

        public async Task<string> GenerateMemberNumber(string memberName)
        {
            return await _memberService.GenerateMemberNumber(memberName);
        }

        public async Task<QuoteV2> GetQuoteV2(int quoteId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var quote = await _quoteV2Repository.FirstOrDefaultAsync(s => s.QuoteId == quoteId);
                await _quoteV2Repository.LoadAsyncIncludeDeleted(quote, t => t.QuoteDetailsV2);

                return Mapper.Map<QuoteV2>(quote);
            }
        }

        public async Task<int> CreateQuotes(List<QuoteV2> quotes)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddLead);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = Mapper.Map<List<quote_QuoteV2>>(quotes);

                foreach (var entity in entities)
                {
                    entity.QuotationNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Quote, "QT");
                }

                var createdQuotes = _quoteV2Repository.Create(entities);
                var result = await scope.SaveChangesAsync().ConfigureAwait(false);
                LeadModel lead = new LeadModel();
                if (quotes != null)
                {
                     lead = await _leadService.GetLead(quotes[0].LeadId);
                }
                if (lead?.LeadClientStatus == LeadClientStatusEnum.New)
                {
                    lead.LeadClientStatus = LeadClientStatusEnum.Active;
                    await _leadService.UpdateLead(lead);
                }

                foreach (var quote in createdQuotes)
                {
                    var type = quote.UnderwriterId == 1 ? "rma-quotation" : "rml-quotation";
                    var startWizardRequest = new StartWizardRequest();
                    startWizardRequest.LinkedItemId = quote.QuoteId;
                    startWizardRequest.Type = type;
                    startWizardRequest.Data = _serializerService.Serialize(Mapper.Map<QuoteV2>(quote));
                    await _wizardService.StartWizard(startWizardRequest);

                    var slaStatusChangeAudit = new SlaStatusChangeAudit
                    {
                        SLAItemType = SLAItemTypeEnum.Quote,
                        ItemId = quote.QuoteId,
                        Status = quote.QuoteStatus.ToString(),
                        EffectiveFrom = DateTimeHelper.SaNow,
                        Reason = "new quote was created"
                    };

                    await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                }

                return result;
            }
        }

        public async Task<int> UpdateQuotes(List<QuoteV2> quotes)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddLead);
            Contract.Requires(quotes!=null && quotes?.Count > 0);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = Mapper.Map<List<quote_QuoteV2>>(quotes);

                _quoteV2Repository.Update(entities);
                var result = await scope.SaveChangesAsync().ConfigureAwait(false);
                if (quotes != null)
                {
                    foreach (var quote in quotes)
                    {
                        var originalStatus = quote.QuoteStatus;
                        var entity = entities.FirstOrDefault(s => s.QuoteId == quote.QuoteId);
                        var isStatusChanged = originalStatus != entity.QuoteStatus;

                        if (isStatusChanged)
                        {
                            var slaStatusChangeAudit = new SlaStatusChangeAudit
                            {
                                SLAItemType = SLAItemTypeEnum.Quote,
                                ItemId = entity.QuoteId,
                                Status = entity.QuoteStatus.ToString(),
                                EffectiveFrom = DateTimeHelper.SaNow,
                                Reason = $"quote status updated from {originalStatus} to {entity.QuoteStatus}"
                            };

                            DateTime? effectiveTo = null;
                            if (entity.QuoteStatus == QuoteStatusEnum.Declined || entity.QuoteStatus == QuoteStatusEnum.Rejected || entity.QuoteStatus == QuoteStatusEnum.AutoAccepted || entity.QuoteStatus == QuoteStatusEnum.Accepted)
                            {
                                effectiveTo = DateTimeHelper.SaNow;
                            }

                            slaStatusChangeAudit.EffictiveTo = effectiveTo;

                            await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                        }
                    }
                }
                return result;
            }
        }

        public async Task<int> UpdateQuote(QuoteV2 quote)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddLead);
            Contract.Requires(quote != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _quoteV2Repository.FirstOrDefaultAsync(s => s.QuoteId == quote.QuoteId);

                var originalStatus = entity.QuoteStatus;
                var isStatusChanged = originalStatus != quote?.QuoteStatus;

                _quoteV2Repository.Update(Mapper.Map<quote_QuoteV2>(quote));
                var result = await scope.SaveChangesAsync().ConfigureAwait(false);

                if (isStatusChanged)
                {
                    var slaStatusChangeAudit = new SlaStatusChangeAudit
                    {
                        SLAItemType = SLAItemTypeEnum.Quote,
                        ItemId = entity.QuoteId,
                        Status = entity.QuoteStatus.ToString(),
                        EffectiveFrom = DateTimeHelper.SaNow,
                        Reason = $"quote status updated from {originalStatus} to {entity.QuoteStatus}"
                    };

                    DateTime? effectiveTo = null;
                    if (quote.QuoteStatus == QuoteStatusEnum.Rejected || quote.QuoteStatus == QuoteStatusEnum.Declined || quote.QuoteStatus == QuoteStatusEnum.AutoAccepted || quote.QuoteStatus == QuoteStatusEnum.Accepted)
                    {
                        effectiveTo = DateTimeHelper.SaNow;
                    }

                    slaStatusChangeAudit.EffictiveTo = effectiveTo;

                    await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                }

                return result;
            }
        }

        public async Task<List<QuoteV2>> GetQuotesV2(int leadId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var quotes = await _quoteV2Repository.Where(s => s.LeadId == leadId).ToListAsync();
                await _quoteV2Repository.LoadAsyncIncludeDeleted(quotes, t => t.QuoteDetailsV2);

                return Mapper.Map<List<QuoteV2>>(quotes);
            }
        }

        public async Task<PagedRequestResult<QuoteV2>> GetPagedQuotesV2(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var leadId = Convert.ToInt32(pagedRequest.SearchCriteria);
                var quotes = await (from quoteV2 in _quoteV2Repository
                                    where quoteV2.LeadId == leadId
                                    select new QuoteV2
                                    {
                                        QuoteId = quoteV2.QuoteId,
                                        LeadId = quoteV2.LeadId,
                                        UnderwriterId = quoteV2.UnderwriterId,
                                        ProductId = quoteV2.ProductId,
                                        DeclineReason = quoteV2.DeclineReason,
                                        QuotationNumber = quoteV2.QuotationNumber,
                                        QuoteStatus = quoteV2.QuoteStatus,
                                        TenantId = quoteV2.TenantId,
                                        TotalPremium = quoteV2.TotalPremium,
                                        CreatedBy = quoteV2.CreatedBy,
                                        CreatedDate = quoteV2.CreatedDate,
                                        ModifiedBy = quoteV2.ModifiedBy,
                                        ModifiedDate = quoteV2.ModifiedDate
                                    }
                    ).ToPagedResult(pagedRequest);

                var mappedQuotes = Mapper.Map<List<quote_QuoteV2>>(quotes.Data);
                await _quoteV2Repository.LoadAsyncIncludeDeleted(mappedQuotes, t => t.QuoteDetailsV2);
                var data = Mapper.Map<List<QuoteV2>>(mappedQuotes);

                return new PagedRequestResult<QuoteV2>
                {
                    Data = data,
                    RowCount = quotes.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(quotes.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<PagedRequestResult<QuoteV2>> SearchQuotesV2Paged(int rolePlayerId, int quoteStatusId, int clientTypeId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var filter = !string.IsNullOrEmpty(pagedRequest.SearchCriteria) ? Convert.ToString(pagedRequest.SearchCriteria).ToUpper() : string.Empty;

                var quoteStatusFilters = quoteStatusId > 0 ? new List<QuoteStatusEnum> { (QuoteStatusEnum)quoteStatusId } : Enum.GetValues(typeof(QuoteStatusEnum)).Cast<QuoteStatusEnum>().ToList();
                var clientTypeFilters = clientTypeId > 0 ? new List<ClientTypeEnum> { (ClientTypeEnum)clientTypeId } : Enum.GetValues(typeof(ClientTypeEnum)).Cast<ClientTypeEnum>().ToList();

                var quotes = new PagedRequestResult<QuoteV2>();

                if (!string.IsNullOrEmpty(filter))
                {
                    if (rolePlayerId > 0)
                    {
                        quotes = await (from quoteV2 in _quoteV2Repository
                                        join lead in _leadRepository
                                        on quoteV2.LeadId equals lead.LeadId
                                        join company in _leadCompanyRepository
                                        on quoteV2.LeadId equals company.LeadId
                                        where (quoteV2.QuotationNumber.Contains(filter) ||
                                        lead.Code.Contains(filter) ||
                                        lead.DisplayName.Contains(filter) ||
                                        quoteV2.CreatedBy.Contains(filter) ||
                                        quoteV2.ModifiedBy.Contains(filter) ||
                                        company.CompensationFundReferenceNumber.Contains(filter) ||
                                        company.CompensationFundRegistrationNumber.Contains(filter) ||
                                        company.RegistrationNumber.Contains(filter)) &&
                                        quoteStatusFilters.Contains(quoteV2.QuoteStatus) &&
                                        clientTypeFilters.Contains(lead.ClientType) &&
                                        lead.RolePlayerId == rolePlayerId
                                        select new QuoteV2
                                        {
                                            QuoteId = quoteV2.QuoteId,
                                            LeadId = quoteV2.LeadId,
                                            UnderwriterId = quoteV2.UnderwriterId,
                                            ProductId = quoteV2.ProductId,
                                            DeclineReason = quoteV2.DeclineReason,
                                            QuotationNumber = quoteV2.QuotationNumber,
                                            QuoteStatus = quoteV2.QuoteStatus,
                                            TenantId = quoteV2.TenantId,
                                            TotalPremium = quoteV2.TotalPremium,
                                            CreatedBy = quoteV2.CreatedBy,
                                            CreatedDate = quoteV2.CreatedDate,
                                            ModifiedBy = quoteV2.ModifiedBy,
                                            ModifiedDate = quoteV2.ModifiedDate
                                        }
                       ).ToPagedResult(pagedRequest);
                    }
                    else
                    {
                        quotes = await (from quoteV2 in _quoteV2Repository
                                        join lead in _leadRepository
                                        on quoteV2.LeadId equals lead.LeadId
                                        join company in _leadCompanyRepository
                                        on quoteV2.LeadId equals company.LeadId
                                        where (quoteV2.QuotationNumber.Contains(filter) ||
                                        lead.Code.Contains(filter) ||
                                        lead.DisplayName.Contains(filter) ||
                                        quoteV2.CreatedBy.Contains(filter) ||
                                        quoteV2.ModifiedBy.Contains(filter) ||
                                        company.CompensationFundReferenceNumber.Contains(filter) ||
                                        company.CompensationFundRegistrationNumber.Contains(filter) ||
                                        company.RegistrationNumber.Contains(filter)) &&
                                        quoteStatusFilters.Contains(quoteV2.QuoteStatus) &&
                                        clientTypeFilters.Contains(lead.ClientType)
                                        select new QuoteV2
                                        {
                                            QuoteId = quoteV2.QuoteId,
                                            LeadId = quoteV2.LeadId,
                                            UnderwriterId = quoteV2.UnderwriterId,
                                            ProductId = quoteV2.ProductId,
                                            DeclineReason = quoteV2.DeclineReason,
                                            QuotationNumber = quoteV2.QuotationNumber,
                                            QuoteStatus = quoteV2.QuoteStatus,
                                            TenantId = quoteV2.TenantId,
                                            TotalPremium = quoteV2.TotalPremium,
                                            CreatedBy = quoteV2.CreatedBy,
                                            CreatedDate = quoteV2.CreatedDate,
                                            ModifiedBy = quoteV2.ModifiedBy,
                                            ModifiedDate = quoteV2.ModifiedDate
                                        }
                           ).ToPagedResult(pagedRequest);
                    }

                }
                else
                {
                    if (rolePlayerId > 0)
                    {
                        quotes = await (from quoteV2 in _quoteV2Repository
                                        join lead in _leadRepository
                                        on quoteV2.LeadId equals lead.LeadId
                                        where quoteStatusFilters.Contains(quoteV2.QuoteStatus) &&
                                        clientTypeFilters.Contains(lead.ClientType) &&
                                        lead.RolePlayerId == rolePlayerId
                                        select new QuoteV2
                                        {
                                            QuoteId = quoteV2.QuoteId,
                                            LeadId = quoteV2.LeadId,
                                            UnderwriterId = quoteV2.UnderwriterId,
                                            ProductId = quoteV2.ProductId,
                                            DeclineReason = quoteV2.DeclineReason,
                                            QuotationNumber = quoteV2.QuotationNumber,
                                            QuoteStatus = quoteV2.QuoteStatus,
                                            TenantId = quoteV2.TenantId,
                                            TotalPremium = quoteV2.TotalPremium,
                                            CreatedBy = quoteV2.CreatedBy,
                                            CreatedDate = quoteV2.CreatedDate,
                                            ModifiedBy = quoteV2.ModifiedBy,
                                            ModifiedDate = quoteV2.ModifiedDate
                                        }
                           ).ToPagedResult(pagedRequest);
                    }
                    else
                    {
                        quotes = await (from quoteV2 in _quoteV2Repository
                                        join lead in _leadRepository
                                        on quoteV2.LeadId equals lead.LeadId
                                        where quoteStatusFilters.Contains(quoteV2.QuoteStatus) &&
                                        clientTypeFilters.Contains(lead.ClientType)
                                        select new QuoteV2
                                        {
                                            QuoteId = quoteV2.QuoteId,
                                            LeadId = quoteV2.LeadId,
                                            UnderwriterId = quoteV2.UnderwriterId,
                                            ProductId = quoteV2.ProductId,
                                            DeclineReason = quoteV2.DeclineReason,
                                            QuotationNumber = quoteV2.QuotationNumber,
                                            QuoteStatus = quoteV2.QuoteStatus,
                                            TenantId = quoteV2.TenantId,
                                            TotalPremium = quoteV2.TotalPremium,
                                            CreatedBy = quoteV2.CreatedBy,
                                            CreatedDate = quoteV2.CreatedDate,
                                            ModifiedBy = quoteV2.ModifiedBy,
                                            ModifiedDate = quoteV2.ModifiedDate
                                        }
                           ).ToPagedResult(pagedRequest);
                    }
                }

                var mappedQuotes = Mapper.Map<List<quote_QuoteV2>>(quotes.Data);
                await _quoteV2Repository.LoadAsyncIncludeDeleted(mappedQuotes, t => t.QuoteDetailsV2);
                var data = Mapper.Map<List<QuoteV2>>(mappedQuotes);

                return new PagedRequestResult<QuoteV2>
                {
                    Data = data,
                    RowCount = quotes.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(quotes.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task EmailQuote(List<string> emailAddresses, QuoteV2 quote)
        {
            Contract.Requires(quote != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var ssrsReportParameters = new Dictionary<string, string>();
                ssrsReportParameters.Add("QuoteId", Convert.ToString(quote?.QuoteId));

                if (quote.UnderwriterId == Convert.ToInt32(UnderwriterEnum.RMAMutualAssurance))
                {
                    await _leadCommunicationService.SendRMAAssuranceQuoteEmail(quote, emailAddresses, ssrsReportParameters);
                }
                else if (quote.UnderwriterId == Convert.ToInt32(UnderwriterEnum.RMALifeAssurance))
                {
                    var productCategoryType = await _productOptionService.GetProductCategoryType(quote.QuoteDetailsV2[0].ProductOptionId);
                    await _leadCommunicationService.SendRMLAssuranceQuoteEmail(quote, emailAddresses, ssrsReportParameters, productCategoryType);
                }
            }
        }
    }
}