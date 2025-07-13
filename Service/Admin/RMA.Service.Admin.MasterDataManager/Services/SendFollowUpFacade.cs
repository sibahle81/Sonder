using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Entities;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Database.Entities;

using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class SendFollowUpFacade : RemotingStatelessService, ISendFollowUpService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly ISendEmailService _emailRepository;
        private readonly IRepository<common_FollowUp> _followUpRepository;

        public SendFollowUpFacade(
            StatelessServiceContext serviceContext,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_FollowUp> followUpRepository,
            ISendEmailService emailRepository
        ) : base(serviceContext)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _followUpRepository = followUpRepository;
            _emailRepository = emailRepository;
        }

        public async Task SendFollowUps(List<FollowUp> followUps)
        {
            Contract.Requires(followUps != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var request = new SendMailRequest();
                foreach (var followUp in followUps)
                {
                    request.Subject = $"Follow-Up Notification For {followUp.ItemType}:{followUp.Reference}";
                    request.FromAddress = "ModTest@randmutual.co.za";
                    request.Recipients = followUp.Email;
                    request.RecipientsCC = "";
                    request.RecipientsBCC = "";
                    request.Body = $@"<html>
                          <body>
                          <p>Good Day {followUp.Name},</p>
                          <p>Message :{followUp.Description}</p>
                          <p>Regards,<br>RMA Online services</br></p>
                          </body>
                          </html>";
                    request.ModifiedBy = followUp.ModifiedBy;
                    request.IsHtml = true;
                    await _emailRepository.SendEmail(request);

                    var entity = await _followUpRepository.SingleAsync(s => s.Id == followUp.Id);
                    entity.AlertSent = true;

                    _followUpRepository.Update(entity);
                }

                await scope.SaveChangesAsync();
            }
        }
    }
}