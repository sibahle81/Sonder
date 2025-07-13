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

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class EmailTemplateFacade : RemotingStatelessService, IEmailTemplateService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_Email> _emailRepository;
        private readonly IRepository<campaign_EmailTemplate> _emailTemplatesRepository;
        private readonly IRepository<campaign_SmsTemplate> _smsTemplatesRepository;
        private readonly IAuditWriter _auditWriter;
        private readonly IMapper _mapper;

        public EmailTemplateFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_EmailTemplate> emailTemplatesRepository,
            IRepository<campaign_SmsTemplate> smsTemplatesRepository,
            IRepository<campaign_Email> emailRepository,
            IAuditWriter auditWriter,
            IMapper mapper
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _emailTemplatesRepository = emailTemplatesRepository;
            _smsTemplatesRepository = smsTemplatesRepository;
            _emailRepository = emailRepository;
            _auditWriter = auditWriter;
            _mapper = mapper;
        }

        public async Task<List<EmailTemplate>> GetEmailTemplates()
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var emailTemplates = await _emailTemplatesRepository
                    .Where(template => template.IsActive)
                    .ProjectTo<EmailTemplate>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return emailTemplates;
            }
        }

        public async Task<List<EmailTemplate>> GetMarketingEmailTemplates()
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var emailTemplates = await _emailTemplatesRepository
                    .Where(template => template.IsActive
                                       && template.TemplateType == null)
                    .ProjectTo<EmailTemplate>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                return emailTemplates;
            }
        }

        public async Task<List<EmailTemplate>> SearchTemplates(string query, bool stripMarkup = true)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await _emailTemplatesRepository
                    .Where(template => template.IsActive && !template.IsDeleted)
                    .Where(template => template.Name.Contains(query)
                                       || template.Template.Contains(query))
                    .ProjectTo<EmailTemplate>(_mapper.ConfigurationProvider)
                    .ToListAsync();
                if (stripMarkup)
                {
                    foreach (var template in templates)
                    {
                        template.Template = "Email Template";
                    }
                }
                return templates;
            }
        }

        public async Task<List<EmailTemplate>> GetCampaignTemplates(int campaignId)
        {
            RmaIdentity.DemandPermission(Permissions.ViewCampaignTemplate);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var templates = await (from ce in _emailRepository
                                       where ce.CampaignId == campaignId && ce.IsActive && !ce.IsDeleted
                                       join et in _emailTemplatesRepository
                                           on new { ce.TemplateId, IsActive = true, IsDeleted = false }
                                           equals new { TemplateId = et.Id, et.IsActive, et.IsDeleted }
                                       select new EmailTemplate
                                       {
                                           Id = et.Id,
                                           Name = et.Name,
                                           Template = et.Template,
                                           TemplateType = et.TemplateType.Value,
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

        public async Task<EmailTemplate> GetEmailTemplate(int id)
        {
            using (_dbContextScopeFactory.Create())
            {
                var template = await _emailTemplatesRepository
                    .Where(s => s.Id == id)
                    .ProjectTo<EmailTemplate>(_mapper.ConfigurationProvider)
                    .SingleAsync($"Email template with id {id} could not be found.");
                await _auditWriter.AddLastViewed<campaign_EmailTemplate>(id);
                return template;
            }
        }

        public async Task<int> AddEmailTemplate(EmailTemplate template)
        {
            Contract.Requires(template != null);
            RmaIdentity.DemandPermission(Permissions.AddCampaignTemplate);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_EmailTemplate>(template);
                _emailTemplatesRepository.Create(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _auditWriter.AddLastViewed<campaign_EmailTemplate>(template.Id);
                return entity.Id;
            }
        }

        public async Task EditEmailTemplate(EmailTemplate template)
        {
            Contract.Requires(template != null);
            RmaIdentity.DemandPermission(Permissions.AddCampaignTemplate);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = _mapper.Map<campaign_EmailTemplate>(template);
                _emailTemplatesRepository.Update(entity);

                await scope.SaveChangesAsync().ConfigureAwait(false);

                await _auditWriter.AddLastViewed<campaign_EmailTemplate>(template.Id);
            }
        }

        private async Task<EmailTemplate> FindEmailTemplateByType(TemplateTypeEnum templateType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var template = await _emailTemplatesRepository
                    .Where(t => t.TemplateType == templateType)
                    .OrderByDescending(t => t.CreatedDate)
                    .ProjectTo<EmailTemplate>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync();

                return template == null ? throw new Exception($"Email template with template type {templateType} could not be found.") : template;
            }
        }

        private async Task<SmsTemplate> FindSmsTemplateByType(TemplateTypeEnum templateType)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var template = await _smsTemplatesRepository
                    .Where(t => t.TemplateType == templateType)
                    .OrderByDescending(t => t.ModifiedDate)
                    .ProjectTo<SmsTemplate>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync();

                return template == null ? throw new Exception($"SMS template with template type {templateType} could not be found.") : template;
            }
        }

        public async Task<MessageContent> GenerateTemplateContent(TemplateTypeEnum templateType, Dictionary<string, string> markers)
        {
            Contract.Requires(markers != null);
            var template = await FindEmailTemplateByType(templateType);
            var content = template.Template;
            foreach (var marker in markers)
            {
                content = content.Replace($"[{marker.Key}]", marker.Value);
                content = content.Replace($"{marker.Key}", marker.Value);
            }
            return new MessageContent
            {
                Key = "message",
                Content = content
            };
        }

        public async Task<MessageContent> GenerateSmsContent(TemplateTypeEnum templateType, Dictionary<string, string> markers)
        {
            Contract.Requires(markers != null);
            var template = await FindSmsTemplateByType(templateType);
            var content = template.Template;
            foreach (var marker in markers)
            {
                content = content.Replace($"{marker.Key}", marker.Value);
            }
            return new MessageContent
            {
                Key = "message",
                Content = content
            };
        }
    }
}