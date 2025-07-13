using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class SmsTemplateFacade : RemotingStatelessService, ISmsTemplateService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IAuditWriter _auditWriter;
        private readonly IRepository<campaign_SmsTemplate> _smsTemplatesRepository;
        private readonly IRepository<campaign_Sm> _smsRepository;
        private readonly IMapper _mapper;

        public SmsTemplateFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_SmsTemplate> smsTemplatesRepository,
            IRepository<campaign_Sm> smsRepository,
            IAuditWriter auditWriter,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _smsTemplatesRepository = smsTemplatesRepository;
            _auditWriter = auditWriter;
            _smsRepository = smsRepository;
            _mapper = mapper;
        }

        public async Task<List<SmsTemplate>> GetSmsTemplates()
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await _smsTemplatesRepository
                    .Where(template => template.IsActive
                                       && !template.IsDeleted)
                    .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                    .ToListAsync();

                return templates;
            }
        }

        public async Task<List<SmsTemplate>> GetSmsTemplatesByIds(List<int> ids)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await _smsTemplatesRepository
                    .Where(template => ids.Contains(template.Id))
                    .Where(template => template.IsActive
                                       && !template.IsDeleted)
                    .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return templates;
            }
        }

        public async Task<List<SmsTemplate>> SearchTemplates(string query)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.Create())
            {
                var templates = await _smsTemplatesRepository
                    .Where(template => template.IsActive && !template.IsDeleted)
                    .Where(template => template.Name.Contains(query) || template.Template.Contains(query))
                    .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                foreach (var template in templates)
                {
                    template.Template = "Sms Template";
                }
                return templates;
            }
        }

        public async Task<List<SmsTemplate>> GetCampaignTemplates(int campaignId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await (from ce in _smsRepository
                                       where ce.CampaignId == campaignId && ce.IsActive && !ce.IsDeleted
                                       join et in _smsTemplatesRepository
                                           on new { ce.TemplateId, IsActive = true, IsDeleted = false }
                                           equals new { TemplateId = et.Id, et.IsActive, et.IsDeleted }
                                       select new SmsTemplate
                                       {
                                           Id = et.Id,
                                           Name = et.Name,
                                           Template = et.Template,
                                           IsActive = et.IsActive,
                                           IsDeleted = et.IsDeleted,
                                           ModifiedBy = et.ModifiedBy,
                                           ModifiedDate = et.ModifiedDate,
                                           CreatedBy = et.CreatedBy,
                                           CreatedDate = et.CreatedDate
                                       }
                    ).ToListAsync();
                return templates;
            }
        }

        public async Task<SmsTemplate> GetSmsTemplate(int id)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var template = await _smsTemplatesRepository
                    .Where(tmp => tmp.Id == id)
                    .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Sms template with id {id} could not be found.");
                await _auditWriter.AddLastViewed<campaign_SmsTemplate>(id);
                return template;
            }
        }

        public async Task<int> AddSmsTemplate(SmsTemplate template)
        {
            Contract.Requires(template != null);
            RmaIdentity.DemandPermission(Permissions.AddCampaignTemplate);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_SmsTemplate>(template);
                _smsTemplatesRepository.Create(entity);
                await _auditWriter.AddLastViewed<campaign_SmsTemplate>(template.Id);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task EditSmsTemplate(SmsTemplate template)
        {
            Contract.Requires(template != null);
            RmaIdentity.DemandPermission(Permissions.EditCampaignTemplate);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_SmsTemplate>(template);
                _smsTemplatesRepository.Update(entity);
                await _auditWriter.AddLastViewed<campaign_SmsTemplate>(template.Id);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<SmsTemplate> GetSmsTemplateByTemplateId(TemplateTypeEnum templateType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var template = await _smsTemplatesRepository
                    .Where(tmp => tmp.TemplateType == templateType)
                    .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Sms template with id {(int)templateType} could not be found.");
                await _auditWriter.AddLastViewed<campaign_SmsTemplate>((int)templateType);
                return template;
            }
        }
    }
}