using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Lead;
using RMA.Service.ClientCare.Contracts.Interfaces.Lead;
using RMA.Service.ClientCare.Database.Entities;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

using LeadModel = RMA.Service.ClientCare.Contracts.Entities.Lead.Lead;


namespace RMA.Service.ClientCare.Services.Lead
{
    public class LeadFacade : RemotingStatelessService, ILeadService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;

        private readonly IRepository<lead_Lead> _leadRepository;
        private readonly IRepository<lead_Person> _leadPersonRepository;
        private readonly IRepository<lead_Company> _leadCompanyRepository;
        private readonly IRepository<lead_Note> _leadNoteRepository;
        private readonly IRepository<lead_ContactV2> _leadContactV2Repository;
        private readonly IRepository<lead_Address> _leadAddressRepository;

        private const string ClientModulePermissionsFFL = "ClientModulePermissions";
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IConfigurationService _configurationService;
        private readonly ISLAService _slaService;

        public LeadFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<lead_Lead> leadRepository,
            IRepository<lead_Company> leadCompanyRepository,
            IRepository<lead_Person> leadPersonRepository,
            IRepository<lead_Note> leadNoteRepository,
            IConfigurationService configurationService,
            IRepository<lead_ContactV2> leadContactV2Repository,
            IDocumentGeneratorService documentGeneratorService,
            IRepository<lead_Address> leadAddressRepository,
            ISLAService slaService) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _leadRepository = leadRepository;
            _leadCompanyRepository = leadCompanyRepository;
            _leadPersonRepository = leadPersonRepository;
            _configurationService = configurationService;
            _documentGeneratorService = documentGeneratorService;
            _leadNoteRepository = leadNoteRepository;
            _leadContactV2Repository = leadContactV2Repository;
            _leadAddressRepository = leadAddressRepository;
            _slaService = slaService;
        }

        public async Task<LeadModel> GetLead(int leadId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewLead);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var leadEntity = await _leadRepository.FirstOrDefaultAsync(s => s.LeadId == leadId);
                await _leadRepository.LoadAsync(leadEntity, t => t.Addresses);
                await _leadRepository.LoadAsync(leadEntity, t => t.Company);
                await _leadRepository.LoadAsync(leadEntity, t => t.Person);
                await _leadRepository.LoadAsync(leadEntity, t => t.ContactV2);
                await _leadRepository.LoadAsync(leadEntity, t => t.Notes);

                return Mapper.Map<LeadModel>(leadEntity);
            }
        }

        public async Task<LeadModel> GetLeadByRolePlayerId(int rolePlayerId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var leadEntity = await _leadRepository.FirstOrDefaultAsync(s => s.RolePlayerId == rolePlayerId);

                if (leadEntity != null)
                {
                    await _leadRepository.LoadAsync(leadEntity, t => t.Addresses);
                    await _leadRepository.LoadAsync(leadEntity, t => t.Company);
                    await _leadRepository.LoadAsync(leadEntity, t => t.Person);
                    await _leadRepository.LoadAsync(leadEntity, t => t.ContactV2);
                    await _leadRepository.LoadAsync(leadEntity, t => t.Notes);
                }

                return Mapper.Map<LeadModel>(leadEntity);
            }
        }

        public async Task<List<LeadModel>> GetLeads()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.ViewLead);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var leads = await _leadRepository.ToListAsync();
                await _leadRepository.LoadAsync(leads, t => t.Company);
                await _leadRepository.LoadAsync(leads, t => t.Person);
                return Mapper.Map<List<LeadModel>>(leads);
            }
        }

        public async Task<LeadModel> CreateNewLead(LeadModel leadModel)
        {
            Contract.Requires(leadModel != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddLead);

            using (var scope = _dbContextScopeFactory.Create())
            {
                if (string.IsNullOrEmpty(leadModel.Code))
                {
                    leadModel.Code = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Lead, "");
                }

                var entity = Mapper.Map<lead_Lead>(leadModel);

                //generate and reserve roleplayerId if converted To Business
                entity.RolePlayerId = await _documentGeneratorService.GenerateTableId(DocumentNumberTypeEnum.RolePlayerId);
                leadModel.RolePlayerId = entity.RolePlayerId;

                var createdLead = _leadRepository.Create(entity);
                var result = await scope.SaveChangesAsync().ConfigureAwait(false);

                var slaStatusChangeAudit = new SlaStatusChangeAudit
                {
                    SLAItemType = SLAItemTypeEnum.Lead,
                    ItemId = createdLead.LeadId,
                    Status = createdLead.LeadClientStatus.ToString(),
                    EffectiveFrom = DateTimeHelper.SaNow,
                    Reason = "new lead was created"
                };

                await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);

                return Mapper.Map<LeadModel>(createdLead);
            }
        }

        public async Task<List<LeadModel>> CreatLeads(List<LeadModel> leads)
        {
            Contract.Requires(leads != null);

            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddLead);

            var createdLeads = new List<LeadModel>();
            foreach (var lead in leads)
            {
                createdLeads.Add(await CreateNewLead(lead));
            }

            return createdLeads;
        }

        public async Task<List<LeadModel>> BulkLeadUpload(List<LeadModel> leads)
        {
            Contract.Requires(leads != null);

            var producer = new ServiceBusQueueProducer<LeadUploadServiceBusMessage>("mcc.clc.createlead");

            foreach (var lead in leads)
            {
                // add to service bus(mcc.clc.createlead) queue for bulk lead upload
                await producer.PublishMessageAsync(new LeadUploadServiceBusMessage()
                {
                    LeadModel = lead,
                    ImpersonateUser = SystemSettings.SystemUserAccount
                });
            }

            return leads;
        }

        public async Task<bool> UpdateLead(LeadModel leadModel)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditLead);
             Contract.Requires(leadModel != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _leadRepository.FirstOrDefaultAsync(s => s.LeadId == leadModel.LeadId);

                var originalStatus = entity.LeadClientStatus;
                var isStatusChanged = originalStatus != leadModel.LeadClientStatus;

                entity = Mapper.Map<lead_Lead>(leadModel);

                entity.Company = null;
                entity.Person = null;

                var leadPerson = await _leadPersonRepository.FindByIdAsync(leadModel.LeadId);
                if (leadPerson != null)
                {
                    leadPerson.FirstName = leadModel.Person.FirstName;
                    leadPerson.IdNumber = leadModel.Person.IdNumber;
                    leadPerson.IdType = leadModel.Person.IdType;
                    leadPerson.Surname = leadModel.Person.Surname;
                }
                var leadCompany = await _leadCompanyRepository.FindByIdAsync(leadModel.LeadId);
                if (leadCompany != null)
                {
                    leadCompany.CompensationFundReferenceNumber = leadModel.Company.CompensationFundReferenceNumber;
                    leadCompany.CompensationFundRegistrationNumber = leadModel.Company.CompensationFundRegistrationNumber;
                    leadCompany.IndustryClass = leadModel.Company.IndustryClass;
                    leadCompany.Name = leadModel.DisplayName;
                    leadCompany.RegistrationNumber = leadModel.Company.RegistrationNumber;
                    leadCompany.RegistrationType = leadModel.Company.RegistrationType;
                    leadCompany.IndustryTypeId = leadModel.Company.IndustryTypeId;
                }

                _leadRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                if (isStatusChanged)
                {
                    var slaStatusChangeAudit = new SlaStatusChangeAudit
                    {
                        SLAItemType = SLAItemTypeEnum.Lead,
                        ItemId = entity.LeadId,
                        Status = entity.LeadClientStatus.ToString(),
                        EffectiveFrom = DateTimeHelper.SaNow,
                        Reason = $"lead status updated from {originalStatus} to {leadModel.LeadClientStatus}"
                    };

                    DateTime? effectiveTo = null;
                    if (entity.LeadClientStatus == LeadClientStatusEnum.Active || entity.LeadClientStatus == LeadClientStatusEnum.Declined)
                    {
                        effectiveTo = DateTimeHelper.SaNow;
                    }

                    slaStatusChangeAudit.EffictiveTo = effectiveTo;

                    await _slaService.HandleSLAStatusChangeAudit(slaStatusChangeAudit);
                }

                return true;
            }
        }

        public async Task<LeadPerson> GetLeadPersonByIdNumber(string idNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var leadPerson = await _leadPersonRepository.FirstOrDefaultAsync(s => s.IdNumber == idNumber);
                return Mapper.Map<LeadPerson>(leadPerson);
            }
        }

        public async Task<LeadCompany> GetLeadCompanyByRegistrationNumber(string registrationNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var leadCompany = await _leadCompanyRepository.FirstOrDefaultAsync(s => s.RegistrationNumber.Trim().ToLower() == registrationNumber.Trim().ToLower());
                return Mapper.Map<LeadCompany>(leadCompany);
            }
        }

        public async Task<LeadCompany> GetLeadCompanyByCFReferenceNumber(string cfReferenceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var leadCompany = await _leadCompanyRepository.FirstOrDefaultAsync(s => s.CompensationFundReferenceNumber.Trim().ToLower() == cfReferenceNumber.Trim().ToLower());
                return Mapper.Map<LeadCompany>(leadCompany);
            }
        }

        public async Task<LeadCompany> GetLeadCompanyByCFRegistrationNumber(string cfRegistrationNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var leadCompany = await _leadCompanyRepository.FirstOrDefaultAsync(s => s.CompensationFundRegistrationNumber.Trim().ToLower() == cfRegistrationNumber.Trim().ToLower());
                return Mapper.Map<LeadCompany>(leadCompany);
            }
        }

        public async Task<PagedRequestResult<LeadModel>> GetPagedLeadsBasic(int leadStatusId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var filter = pagedRequest.SearchCriteria;
                    var leadStatusFilters = leadStatusId > 0 ? new List<LeadClientStatusEnum> { (LeadClientStatusEnum)leadStatusId } : Enum.GetValues(typeof(LeadClientStatusEnum)).Cast<LeadClientStatusEnum>().ToList();

                    var leads = new PagedRequestResult<LeadModel>();

                    if (!string.IsNullOrEmpty(filter))
                    {
                        leads = await (from lead in _leadRepository
                                       join company in _leadCompanyRepository
                                       on lead.LeadId equals company.LeadId
                                       where (lead.DisplayName.Contains(filter) ||
                                            lead.Code.Contains(filter) ||
                                            lead.AssignedTo.Contains(filter) ||
                                            company.RegistrationNumber.Contains(filter) ||
                                            company.CompensationFundReferenceNumber.Contains(filter) ||
                                            company.CompensationFundRegistrationNumber.Contains(filter)) &&
                                            leadStatusFilters.Contains(lead.LeadClientStatus)
                                       select new LeadModel
                                       {
                                           LeadId = lead.LeadId,
                                           DisplayName = lead.DisplayName,
                                           Code = lead.Code,
                                           ClientType = lead.ClientType,
                                           LeadClientStatus = lead.LeadClientStatus,
                                           LeadSource = lead.LeadSource,
                                           AssignedTo = lead.AssignedTo
                                       }).ToPagedResult(pagedRequest);
                    }
                    else
                    {
                        leads = await (from lead in _leadRepository
                                       where leadStatusFilters.Contains(lead.LeadClientStatus)
                                       select new LeadModel
                                       {
                                           LeadId = lead.LeadId,
                                           DisplayName = lead.DisplayName,
                                           Code = lead.Code,
                                           ClientType = lead.ClientType,
                                           LeadClientStatus = lead.LeadClientStatus,
                                           LeadSource = lead.LeadSource,
                                           AssignedTo = lead.AssignedTo
                                       }).ToPagedResult(pagedRequest);
                    }

                    var mappedLeads = Mapper.Map<List<lead_Lead>>(leads.Data);
                    await _leadRepository.LoadAsync(mappedLeads, t => t.Company);
                    var data = Mapper.Map<List<LeadModel>>(mappedLeads);

                    return new PagedRequestResult<LeadModel>
                    {
                        Data = data,
                        RowCount = leads.RowCount,
                        Page = pagedRequest.Page,
                        PageSize = pagedRequest.PageSize,
                        PageCount = (int)Math.Ceiling(leads.RowCount / (double)pagedRequest.PageSize)
                    };
                }
            }
        }

        public async Task<PagedRequestResult<LeadNote>> GetPagedLeadNotes(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var leadId = Convert.ToInt32(pagedRequest.SearchCriteria);
                var leadNotes = await (from leadNote in _leadNoteRepository
                                       where leadNote.LeadId == leadId
                                       select new LeadNote
                                       {
                                           NoteId = leadNote.NoteId,
                                           LeadId = leadNote.LeadId,
                                           Note = leadNote.Note,
                                           CreatedBy = leadNote.CreatedBy,
                                           CreatedDate = leadNote.CreatedDate,
                                           ModifiedBy = leadNote.ModifiedBy,
                                           ModifiedDate = leadNote.ModifiedDate
                                       }
                    ).ToPagedResult(pagedRequest);

                return new PagedRequestResult<LeadNote>
                {
                    Data = leadNotes.Data,
                    RowCount = leadNotes.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(leadNotes.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<int> AddLeadNote(LeadNote leadNote)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddPolicy);
            Contract.Requires(leadNote != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<lead_Note>(leadNote);
                _leadNoteRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.NoteId;
            }
        }

        public async Task EditLeadNote(LeadNote leadNote)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);
            Contract.Requires(leadNote != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<lead_Note>(leadNote);
                _leadNoteRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PagedRequestResult<LeadContactV2>> GetPagedLeadContactsV2(PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var leadId = Convert.ToInt32(pagedRequest.SearchCriteria);
                var contacts = await (from contactV2 in _leadContactV2Repository
                                      where contactV2.LeadId == leadId
                                      select new LeadContactV2
                                      {
                                          ContactId = contactV2.ContactId,
                                          LeadId = contactV2.LeadId,
                                          Name = contactV2.Name,
                                          Surname = contactV2.Surname,
                                          ContactNumber = contactV2.ContactNumber,
                                          EmailAddress = contactV2.EmailAddress,
                                          TelephoneNumber = contactV2.TelephoneNumber,
                                          PreferredCommunicationTypeId = contactV2.PreferredCommunicationTypeId,
                                          CreatedBy = contactV2.CreatedBy,
                                          CreatedDate = contactV2.CreatedDate,
                                          ModifiedBy = contactV2.ModifiedBy,
                                          ModifiedDate = contactV2.ModifiedDate
                                      }
                    ).ToPagedResult(pagedRequest);

                return new PagedRequestResult<LeadContactV2>
                {
                    Data = contacts.Data,
                    RowCount = contacts.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(contacts.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<int> AddLeadContactV2(LeadContactV2 leadContactV2)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddPolicy);
            Contract.Requires(leadContactV2 != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<lead_ContactV2>(leadContactV2);
                _leadContactV2Repository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.ContactId;
            }
        }

        public async Task EditLeadContactV2(LeadContactV2 leadContactV2)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);
            Contract.Requires(leadContactV2 != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<lead_ContactV2>(leadContactV2);
                _leadContactV2Repository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<PagedRequestResult<LeadAddress>> GetPagedLeadAddresses(PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);
                var leadId = Convert.ToInt32(pagedRequest.SearchCriteria);
                var addresses = await (from address in _leadAddressRepository
                                       where address.LeadId == leadId
                                       select new LeadAddress
                                       {
                                           AddressId = address.AddressId,
                                           AddressLine1 = address.AddressLine1,
                                           AddressLine2 = address.AddressLine2,
                                           AddressType = address.AddressType,
                                           City = address.City,
                                           CountryId = address.CountryId,
                                           PostalCode = address.PostalCode,
                                           Province = address.Province,
                                           CreatedBy = address.CreatedBy,
                                           CreatedDate = address.CreatedDate,
                                           ModifiedBy = address.ModifiedBy,
                                           ModifiedDate = address.ModifiedDate
                                       }
                    ).ToPagedResult(pagedRequest);

                return new PagedRequestResult<LeadAddress>
                {
                    Data = addresses.Data,
                    RowCount = addresses.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(addresses.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<int> AddLeadAddress(LeadAddress leadAddress)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.AddPolicy);
            Contract.Requires(leadAddress != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<lead_Address>(leadAddress);
                _leadAddressRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                return entity.AddressId;
            }
        }

        public async Task EditLeadAddress(LeadAddress leadAddress)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(ClientModulePermissionsFFL) && RmaIdentity.UserId > 0)
                RmaIdentity.DemandPermission(Permissions.EditPolicy);
            Contract.Requires(leadAddress != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<lead_Address>(leadAddress);
                _leadAddressRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
    }
}