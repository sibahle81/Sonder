using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Constants;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ScanCare.Contracts.Entities;
using RMA.Service.ScanCare.Contracts.Interfaces.Document;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class EmailFacade : RemotingStatelessService, IEmailService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<campaign_Email> _emailRepository;
        private readonly IRepository<campaign_EmailAudit> _emailAuditRepository;
        private readonly IRepository<campaign_EmailAuditAttachment> _emailAuditAttachmentRepository;
        private readonly IRepository<campaign_EmailToken> _tokenRepository;
        private readonly IRepository<campaign_EmailTemplate> _emailTemplateRepository;
        private readonly IDocumentIndexService _documentIndexService;
        private readonly IMapper _mapper;

        public EmailFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_Email> emailRepository,
            IRepository<campaign_EmailAudit> emailAuditRepository,
            IRepository<campaign_EmailAuditAttachment> emailAuditAttachmentRepository,
            IRepository<campaign_EmailToken> tokenRepository,
            IRepository<campaign_EmailTemplate> emailTemplateRepository,
            IDocumentIndexService documentIndexService,
            IMapper mapper
         )
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _emailRepository = emailRepository;
            _emailAuditRepository = emailAuditRepository;
            _emailAuditAttachmentRepository = emailAuditAttachmentRepository;
            _tokenRepository = tokenRepository;
            _emailTemplateRepository = emailTemplateRepository;
            _documentIndexService = documentIndexService;
            _mapper = mapper;
        }

        public async Task<MessageContent> GetEmailContent(Email email)
        {
            if (email != null)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var template = await FindEmailTemplate(email.TemplateId);
                    var content = template.Template;
                    // First replace the tokens passed as parameters...
                    foreach (var token in email.Tokens)
                    {
                        content = content.Replace($"[{token.Key}]", token.Value);
                    }
                    // ... then replace the tokens read from the database.
                    var dataEmail = await FindEmail(email.Id);
                    foreach (var token in dataEmail.EmailTokens)
                    {
                        content = content.Replace($"[{token.TokenKey}]", token.TokenValue);
                    }
                    return new MessageContent
                    {
                        Key = "message",
                        Content = content
                    };
                }
            }
            return new MessageContent
            {
                Key = "message",
                Content = string.Empty
            };
        }

        public async Task<MessageContent> GetEmailContentByEmailId(int emailId)
        {
            using (_dbContextScopeFactory.Create())
            {
                var data = await FindEmail(emailId);
                data.EmailTokens = await GetEmailTokens(emailId);
                var email = _mapper.Map<Email>(data);
                return await GetEmailContent(email);
            }
        }

        public async Task<Email> GetEmail(int id)
        {
            using (_dbContextScopeFactory.Create())
            {
                var data = await FindEmail(id);
                return _mapper.Map<Email>(data);
            }
        }

        public async Task<Email> GetCampaignEmail(int campaignId)
        {
            using (_dbContextScopeFactory.Create())
            {
                var email = await _emailRepository
                    .ProjectTo<Email>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync(e => e.CampaignId == campaignId
                                              && e.IsActive);
                return email;
            }
        }

        public async Task<int> AddEmail(Email email)
        {
            RmaIdentity.DemandPermission(Permissions.AddCampaign);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataEmail = _mapper.Map<campaign_Email>(email);
                _emailRepository.Create(dataEmail);
                await scope.SaveChangesAsync();
                return dataEmail.Id;
            }
        }

        public async Task EditEmail(Email email)
        {
            RmaIdentity.DemandPermission(Permissions.EditCampaign);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataEmail = _mapper.Map<campaign_Email>(email);
                _emailRepository.Update(dataEmail);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> AddEmailAudit(SendMailRequest sendMail)
        {
            int mailAuditId = 0;
            if (sendMail != null)
            {
                sendMail.CreatedBy = sendMail.FromAddress;

                sendMail.ModifiedBy = sendMail.FromAddress;

                //Insert campaign.EmailAudit
                var emailAudit = new EmailAudit()
                {
                    ItemType = sendMail.ItemType,
                    ItemId = sendMail.ItemId,
                    Subject = sendMail.Subject,
                    FromAddress = sendMail.FromAddress,
                    Reciepients = sendMail.Recipients,
                    ReciepientsCc = sendMail.RecipientsCC,
                    ReciepientsBcc = sendMail.RecipientsBCC,
                    Body = sendMail.Body,
                    IsSuccess = sendMail.isSuccess,
                    IsHtml = sendMail.IsHtml,
                    ProcessDescription = sendMail.ProcessDescription,
                    ModifiedBy = RmaIdentity.Email,
                    CreatedBy = RmaIdentity.Email,
                    ModifiedDate = DateTimeHelper.SaNow,
                    CreatedDate = DateTimeHelper.SaNow,
                    Department = sendMail.Department.DisplayAttributeValue(),
                    BusinessArea = sendMail.BusinessArea.DisplayAttributeValue()
                };

                using (var scope = _dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
                {
                    var dataEmailAudit = _mapper.Map<campaign_EmailAudit>(emailAudit);
                    _emailAuditRepository.Create(dataEmailAudit);
                    await scope.SaveChangesAsync();
                    mailAuditId = dataEmailAudit.Id;
                }

                //Insert campaign.EmailAudit
                var emailAuditAttachment = new List<EmailAuditAttachment>();
                if (sendMail.Attachments != null)
                {
                    foreach (var sendEmailAttachment in sendMail.Attachments)
                    {
                        if (sendEmailAttachment == null || sendEmailAttachment.SkipSaveAttachment) continue;
                        try
                        {
                            emailAuditAttachment.Add(new EmailAuditAttachment()
                            {
                                EmailAuditId = mailAuditId,
                                FileName = sendEmailAttachment.FileName,
                                FileType = sendEmailAttachment.FileType
                            });

                            await UploadEmailAttachmentDocument
                            (
                                DocumentTypeEnum.EmailAttachment,
                                sendEmailAttachment.FileName,
                                new Dictionary<string, string> { { "EmailAuditId", $"{mailAuditId}" } },
                                sendEmailAttachment.FileType,
                                DocumentSetEnum.EmailAttachment,
                                sendEmailAttachment.AttachmentByteData
                            );

                            using (var scope = _dbContextScopeFactory.Create())
                            {
                                var dataEmailAuditAttachment = _mapper.Map<List<campaign_EmailAuditAttachment>>(emailAuditAttachment);
                                _emailAuditAttachmentRepository.Create(dataEmailAuditAttachment);
                                await scope.SaveChangesAsync();
                            }
                        }
                        catch (Exception e)
                        {
                            e.LogApiException();
                        }
                    }

                }
            }
            return mailAuditId;
        }

        public async Task<List<EmailAudit>> GetEmailAudit(int itemId, string itemType)
        {
            var emailAuditList = new List<EmailAudit>();
            try
            {
                //This is one of the methods causing out of memory,,, so limiting audit to last 10
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var audits = await _emailAuditRepository
                       .Where(t => t.ItemId == itemId && t.ItemType == itemType)
                       .OrderByDescending(t => t.CreatedDate)
                       .Take(10)
                       .ToListAsync();

                    emailAuditList = _mapper.Map<List<EmailAudit>>(audits);

                    //Attachments are causing system out of memory issues
                    //Get attachments on request... and/or on resend
                    if (emailAuditList?.Count > 0)
                        emailAuditList.ForEach(a => a.Attachments = new List<MailAttachment>());
                }
            }
            catch (Exception e)
            {
                e.LogException();
            }
            return emailAuditList;
        }

        public async Task<List<MailAttachment>> GetMailAttachmentsByAuditId(int emailAuditId)
        {
            List<MailAttachment> mailAttachments = new List<MailAttachment>();
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var docs = await _documentIndexService.GetDocumentsBySetAndKey(DocumentSetEnum.EmailAttachment, new Dictionary<string, string> { { "EmailAuditId", emailAuditId.ToString() } });
                    if (docs?.Count > 0)
                    {
                        foreach (var item in docs)
                        {
                            if (item.Id == 0) continue;

                            mailAttachments.Add(await _documentIndexService.GetDocumentMailAttachment(item.Id));
                        }
                    }
                }
            }
            catch (Exception e)
            {
                e.LogException();
            }

            return mailAttachments;
        }

        public async Task CopyEmails(int campaignId, int newCampaignId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var emails = await _emailRepository
                    .Where(e => e.CampaignId == campaignId)
                    .ToListAsync();
                foreach (var email in emails)
                {
                    _emailRepository.Load(email, d => d.EmailTokens);
                    _emailRepository.Detatch(email);
                    email.Id = 0;
                    email.CampaignId = newCampaignId;
                    foreach (var token in email.EmailTokens)
                    {
                        _emailRepository.Detatch(token);
                        token.Id = 0;
                    }
                    _emailRepository.Create(email);
                }
                await scope.SaveChangesAsync();
            }
        }

        public async Task ModifyCampaignEmails(List<Email> campaignEmails)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (campaignEmails == null) return;
                if (campaignEmails.Count == 0) return;
                foreach (var email in campaignEmails)
                {
                    if (email.Id == 0)
                        await AddEmail(email);
                    else
                        await EditEmail(email);
                }
                await scope.SaveChangesAsync();
            }
        }

        public async Task<bool> EmailAlreadySent(string itemType, int itemId, List<string> recipients, DateTime date)
        {
            Contract.Requires(recipients != null);

            if (recipients.Count == 0) return false;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var cutoff = date.AddHours(-18);
                var emails = await _emailAuditRepository
                    .Where(s => s.CreatedDate >= cutoff
                             && s.ItemType == itemType
                             && s.ItemId == itemId)
                    .ToListAsync();

                if (emails.Count == 0) return false;

                foreach (var recipient in recipients)
                {
                    var items = emails.Where(e => e.Reciepients.IndexOf(recipient, StringComparison.OrdinalIgnoreCase) >= 0).ToList();
                    if (items?.Count > 0)
                    {
                        return true;
                    }
                }

                return false;
            }
        }

        public async Task<bool> CheckEmailAlreadySent(string itemType, string subject, int itemId, List<string> recipients, DateTime date)
        {
            Contract.Requires(recipients != null);

            if (recipients.Count == 0) return false;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var cutoff = date.AddHours(-18);
                var emails = await _emailAuditRepository
                    .Where(s => s.CreatedDate >= cutoff
                             && s.ItemType == itemType
                             && s.Subject == subject
                             && s.ItemId == itemId)
                    .ToListAsync();

                if (emails.Count == 0) return false;

                foreach (var recipient in recipients)
                {
                    var items = emails.Where(e => e.Reciepients.IndexOf(recipient, StringComparison.OrdinalIgnoreCase) >= 0).ToList();
                    if (items?.Count > 0)
                    {
                        return true;
                    }
                }

                return false;
            }
        }

        public async Task<bool> CheckIfEmailAlreadySent(string itemType, string subject, int itemId, List<string> recipients)
        {
            Contract.Requires(recipients != null);

            if (recipients.Count == 0) return false;

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var emails = await _emailAuditRepository
                    .Where(s => s.ItemType == itemType
                             && s.Subject == subject
                             && s.ItemId == itemId)
                    .ToListAsync();

                if (emails.Count == 0) return false;

                foreach (var recipient in recipients)
                {
                    var items = emails.Where(e => e.Reciepients.IndexOf(recipient, StringComparison.OrdinalIgnoreCase) >= 0).ToList();
                    if (items?.Count > 0)
                    {
                        return true;
                    }
                }

                return false;
            }
        }

        public async Task<EmailAudit> EmailAuditAndAttachment(int Id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var audit = await _emailAuditRepository
                    .SingleOrDefaultAsync(t => t.Id == Id);

                if (audit != null)
                {
                    EmailAudit emailAudit = _mapper.Map<EmailAudit>(audit);
                    emailAudit.Attachments = await GetAttachments(audit.Id);
                    return emailAudit;
                }

                return new EmailAudit();
            }
        }

        public async Task<List<EmailAudit>> GetEmailAuditByDate(string itemType, DateTime startDate)
        {
            var emailAuditList = new List<EmailAudit>();
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var audits = await _emailAuditRepository
                       .Where(t => t.ItemType == itemType && System.Data.Entity.DbFunctions.TruncateTime(t.CreatedDate) == startDate)
                       .OrderByDescending(t => t.CreatedDate)
                       .Take(10)
                       .ToListAsync();

                    emailAuditList = _mapper.Map<List<EmailAudit>>(audits);

                    //Attachments are causing system out of memory issues
                    //Get attachments on request... and/or on resend
                    if (emailAuditList?.Count > 0)
                        emailAuditList.ForEach(a => a.Attachments = new List<MailAttachment>());
                }
            }
            catch (Exception e)
            {
                e.LogException();
            }
            return emailAuditList;
        }

        public async Task<PagedRequestResult<EmailAudit>> GetPagedEmailAudit(PagedRequest request, string itemType, DateTime startDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var audits = await _emailAuditRepository
                        .Where(t => t.ItemType == itemType && System.Data.Entity.DbFunctions.TruncateTime(t.CreatedDate) == startDate)
                        .Select(x => new EmailAudit
                        {
                            Id = x.Id,
                            IsSuccess = x.IsSuccess,
                            ItemId = x.ItemId,
                            ItemType = x.ItemType,
                            Reciepients = x.Reciepients,
                            Subject = x.Subject,
                            FromAddress = x.FromAddress,
                            CreatedDate = x.CreatedDate
                        }).ToPagedResult(request);

                if (audits.Data.Count == 0)
                    return new PagedRequestResult<EmailAudit>();
                return new PagedRequestResult<EmailAudit>()
                {
                    PageSize = audits.PageSize,
                    Page = audits.Page,
                    PageCount = audits.PageCount,
                    RowCount = audits.RowCount,
                    Data = audits.Data
                };

            }
        }

        public async Task<DateTime> GetEmailSentDate(int itemId, string itemType, string subject)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var audit = await _emailAuditRepository
                   .FirstOrDefaultAsync(t => t.ItemId == itemId && t.ItemType == itemType && t.Subject == subject);
                return audit != null ? audit.CreatedDate : DateTime.MinValue;
            }

        }

        public async Task<List<EmailAudit>> GetEmailAuditDetails(int itemId, string itemType)
        {
            var emailAuditList = new List<EmailAudit>();
            try
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var audits = await _emailAuditRepository
                       .Where(t => t.ItemId == itemId && t.ItemType == itemType)
                       .OrderByDescending(t => t.CreatedDate)
                       .ToListAsync();

                    emailAuditList = _mapper.Map<List<EmailAudit>>(audits);

                    if (emailAuditList?.Count > 0)
                        emailAuditList.ForEach(a => a.Attachments = new List<MailAttachment>());
                }
            }
            catch (Exception e)
            {
                e.LogException();
            }
            return emailAuditList;
        }

        public async Task<PagedRequestResult<EmailAudit>> GetPagedEmailAudits(int itemId, string itemType, PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);

            var filter = pagedRequest.SearchCriteria;
            var audits = new PagedRequestResult<EmailAudit>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (string.IsNullOrEmpty(filter))
                {
                    audits = await _emailAuditRepository
                            .Where(t => t.ItemType == itemType && t.ItemId == itemId)
                            .Select(x => new EmailAudit
                            {
                                Id = x.Id,
                                IsSuccess = x.IsSuccess,
                                ItemId = x.ItemId,
                                ItemType = x.ItemType,
                                Reciepients = x.Reciepients,
                                ReciepientsCc = x.ReciepientsCc,
                                ReciepientsBcc = x.ReciepientsBcc,
                                Subject = x.Subject,
                                FromAddress = x.FromAddress,
                                CreatedDate = x.CreatedDate,
                                CreatedBy = x.CreatedBy,
                                Body = x.Body,
                                IsHtml = x.IsHtml,
                                ProcessDescription = x.ProcessDescription
                            })
                            .ToPagedResult(pagedRequest);
                }
                else
                {
                    audits = await _emailAuditRepository
                            .Where(t => t.ItemType == itemType && t.ItemId == itemId && (t.Reciepients.Contains(filter) || t.FromAddress.Contains(filter) || t.Subject.Contains(filter)))
                            .Select(x => new EmailAudit
                            {
                                Id = x.Id,
                                IsSuccess = x.IsSuccess,
                                ItemId = x.ItemId,
                                ItemType = x.ItemType,
                                Reciepients = x.Reciepients,
                                ReciepientsCc = x.ReciepientsCc,
                                ReciepientsBcc = x.ReciepientsBcc,
                                Subject = x.Subject,
                                FromAddress = x.FromAddress,
                                CreatedDate = x.CreatedDate,
                                Body = x.Body,
                                IsHtml = x.IsHtml,
                                ProcessDescription = x.ProcessDescription
                            }).ToPagedResult(pagedRequest);
                }

            }

            if (audits.Data?.Count > 0)
            {
                foreach (var emailAudit in audits.Data)
                {
                    emailAudit.Attachments = await GetAttachments(emailAudit.Id);
                }
            }

            return new PagedRequestResult<EmailAudit>()
            {
                PageSize = audits.PageSize,
                Page = audits.Page,
                PageCount = audits.PageCount,
                RowCount = audits.RowCount,
                Data = audits.Data
            };
        }

        public async Task<PagedRequestResult<EmailAudit>> GetEmailAuditForPolicy(int policyId, PagedRequest pagedRequest)
        {
            Contract.Requires(pagedRequest != null);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var filter = String.IsNullOrWhiteSpace(pagedRequest.SearchCriteria)
                    ? "" : pagedRequest.SearchCriteria.Trim();
                // Use a stored procedure because the EmailAudit table also has to 
                // join on policy.Policy, claim.Claim, and claim.PersonEvent
                var list = await _emailAuditRepository.SqlQueryAsync<EmailAudit>(
                    DatabaseConstants.GetPolicyEmailAudit,
                    new SqlParameter { ParameterName = "@policyId", Value = policyId },
                    new SqlParameter { ParameterName = "@filter", Value = filter}
                );

                // Calculate the startIndex and number of pages
                var startIndex = (pagedRequest.Page - 1) * pagedRequest.PageSize;
                var pages = (double)list.Count / pagedRequest.PageSize;

                // Check if the parameters exceed the available data
                if (list.Count == 0 || startIndex > list.Count)
                {
                    return new PagedRequestResult<EmailAudit>
                    {
                        Data = new List<EmailAudit>(),
                        RowCount = list.Count,
                        PageCount = (int)Math.Ceiling(pages),
                        PageSize = pagedRequest.PageSize,
                        Page = pagedRequest.Page
                    };
                }

                // Filter the emails and get the attachements
                var emails = list
                    .GetRange(startIndex, Math.Min(pagedRequest.PageSize, list.Count))
                    .OrderByDescending(s => s.Id)
                    .ToList();
                foreach (var email in emails)
                {
                    email.Attachments = await GetMailAttachmentsByAuditId(email.Id);
                }

                // Create the result set
                return new PagedRequestResult<EmailAudit>
                {
                    Data = emails,
                    RowCount = list.Count,
                    PageCount = (int)Math.Ceiling(pages),
                    PageSize = pagedRequest.PageSize,
                    Page = pagedRequest.Page
                };
            }
        }

        #region Private Methods
        private async Task<List<MailAttachment>> GetAttachments(int emailAuditId)
        {
            List<MailAttachment> mailAttachments = new List<MailAttachment>();
            try
            {
                var docs = await _documentIndexService.GetDocumentsBySetAndKey(DocumentSetEnum.EmailAttachment, new Dictionary<string, string> { { "EmailAuditId", emailAuditId.ToString() } });
                if (docs?.Count > 0)
                {
                    foreach (var item in docs)
                    {
                        if (item.Id == 0) continue;

                        mailAttachments.Add(await _documentIndexService.GetDocumentMailAttachment(item.Id));
                    }
                }
            }
            catch (Exception e)
            {
                e.LogException();
            }

            return mailAttachments;
        }
        private async Task<campaign_EmailTemplate> FindEmailTemplate(int id)
        {
            using (_dbContextScopeFactory.Create(DbContextScopeOption.ForceCreateNew))
            {
                var template = await _emailTemplateRepository
                    .Where(t => t.Id == id)
                    .SingleAsync($"Email template with id {id} could not be found.");
                return template;
            }
        }
        private async Task<campaign_Email> FindEmail(int id)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var email = await _emailRepository
                    .Where(e => e.Id == id)
                    .SingleAsync($"Campaign email with id {id} could not be found.");
                return email;
            }
        }
        private async Task<List<campaign_EmailToken>> GetEmailTokens(int emailId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _tokenRepository
                    .Where(t => t.EmailId == emailId && t.IsActive && !t.IsDeleted)
                    .ToListAsync();
                return data;
            }
        }
        private async Task UploadEmailAttachmentDocument(DocumentTypeEnum documentType, string fileName, Dictionary<string, string> keys, string fileExtension, DocumentSetEnum documentSet, byte[] documentBytes)
        {
            var emailAttachmentDocument = new Document
            {
                DocTypeId = (int)documentType,
                SystemName = "CommonManager",
                FileName = fileName,
                Keys = keys,
                DocumentStatus = DocumentStatusEnum.Received,
                FileExtension = fileExtension,
                DocumentSet = documentSet,
                FileAsBase64 = Convert.ToBase64String(documentBytes),
                MimeType = MimeMapping.GetMimeMapping(fileName)
            };

            await _documentIndexService.UploadDocument(emailAttachmentDocument);
        }
        #endregion
    }
}