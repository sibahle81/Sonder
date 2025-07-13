using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Entities;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;

using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Services
{
    public class TargetAudienceMemberFacade : RemotingStatelessService, ITargetAudienceMemberService
    {
        private readonly IRepository<campaign_TargetAudienceMember> _memberRepository;
        private readonly IRepository<campaign_TargetAudience> _audienceRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IMapper _mapper;

        public TargetAudienceMemberFacade(
            StatelessServiceContext serviceContext,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<campaign_TargetAudience> audienceRepository,
            IRepository<campaign_TargetAudienceMember> memberRepository,
            IMapper mapper
        ) : base(serviceContext)
        {
            _memberRepository = memberRepository;
            _audienceRepository = audienceRepository;
            _dbContextScopeFactory = dbContextScopeFactory;
            _mapper = mapper;
        }

        public async Task<List<TargetAudienceMember>> GetAudienceMembers(int campaignId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var members = await (from ta in _audienceRepository
                                     where ta.CampaignId == campaignId && ta.IsActive && !ta.IsDeleted
                                     join tam in _memberRepository
                                         on new { TargetAudienceId = ta.Id, ta.IsActive, ta.IsDeleted }
                                         equals new { tam.TargetAudienceId, tam.IsActive, tam.IsDeleted }
                                     select new TargetAudienceMember
                                     {
                                         Id = tam.Id,
                                         TargetAudienceId = tam.TargetAudienceId,
                                         PolicyId = tam.PolicyId,
                                         Name = tam.Name,
                                         ContactName = tam.ContactName,
                                         Email = tam.Email,
                                         MobileNo = tam.MobileNo,
                                         PhoneNo = tam.PhoneNo,
                                         Status = tam.Status,
                                         IsActive = tam.IsActive,
                                         IsDeleted = tam.IsDeleted,
                                         ModifiedBy = tam.ModifiedBy,
                                         ModifiedDate = tam.ModifiedDate,
                                         CreatedBy = tam.CreatedBy,
                                         CreatedDate = tam.CreatedDate
                                     }
                    ).ToListAsync();
                return members;
            }
        }

        public async Task<int> SaveTargetAudienceMembers(List<TargetAudienceMember> members)
        {
            Contract.Requires( members != null );
            if (members.Count == 0) return 0;
            RmaIdentity.DemandPermission(Permissions.AddTargetAudience);
            using (var scope = _dbContextScopeFactory.Create())
            {
                // Clear the existing target audience members.
                var targetAudienceId = members[0].TargetAudienceId;
                var memberList = await _memberRepository
                    .Where(m => m.TargetAudienceId == targetAudienceId && m.IsActive && !m.IsDeleted)
                    .ToListAsync();
                foreach (var member in memberList)
                {
                    member.IsActive = false;
                    member.IsDeleted = true;
                    _memberRepository.Update(member);
                }
                // Add the target audience members
                foreach (var member in members)
                {
                    var entity = _mapper.Map<campaign_TargetAudienceMember>(member);
                    _memberRepository.Create(entity);
                }
                var count = await scope.SaveChangesAsync().ConfigureAwait(false);
                return count;
            }
        }
    }
}
