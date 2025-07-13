using AutoMapper;

using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Database.Entities;

using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace RMA.Service.ClientCare.Mappers
{
    public class RolePlayerMappingProfile : Profile
    {
        //Force Recompile 2024/10/13 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2024/10/13 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/04/15 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE
        //Force Recompile 2025/04/15 -- PLEASE DO NOT REMOVE THIS LINE, JUST CHANGE THE DATE TO FORCE

        public RolePlayerMappingProfile()
        {
            CreateMap<client_RolePlayer, RolePlayer>()
                .ForMember(s => s.FromRolePlayers, opt => opt.MapFrom(d => d.RolePlayerRelations_FromRolePlayerId))
                .ForMember(s => s.ToRolePlayers, opt => opt.MapFrom(d => d.RolePlayerRelations_ToRolePlayerId))
                .ForMember(s => s.Benefits, opt => opt.Ignore())
                .ForMember(s => s.JoinDate, opt => opt.MapFrom(d => d.CreatedDate))
                .ForMember(s => s.EndDate, opt => opt.Ignore())
                .ForMember(s => s.ForensicPathologist, opt => opt.Ignore())
                .ForMember(s => s.Informant, opt => opt.Ignore())
                .ForMember(s => s.Claimant, opt => opt.Ignore())
                .ForMember(s => s.KeyRoleType, opt => opt.Ignore())
                .ForMember(s => s.HasActiveCoidPolicies, opt => opt.Ignore())
                .ForMember(s => s.HasActiveFuneralPolicies, opt => opt.Ignore())
                .ForMember(s => s.HasActiveVapsPolicies, opt => opt.Ignore())
                .ForMember(s => s.CaseTypeId, opt => opt.Ignore())
                .ForMember(s => s.ProductId, opt => opt.Ignore())
                .ForMember(s => s.PolicyId, opt => opt.Ignore())
                .ForMember(s => s.Policies, opt => opt.Ignore())
                .ForMember(s => s.PolicyPayees, opt => opt.Ignore())
                .ForMember(s => s.TotalCoverAmount, opt => opt.Ignore())
                .ForMember(s => s.VopDResponse, opt => opt.Ignore())
                .ForMember(s => s.InsuredLifeRemovalReason, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.PreviousInsurerRolePlayers, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerRelations_FromRolePlayerId, opt => opt.MapFrom(d => d.FromRolePlayers))
                .ForMember(s => s.RolePlayerRelations_ToRolePlayerId, opt => opt.MapFrom(d => d.ToRolePlayers))
                .ForMember(s => s.Representative, opt => opt.Ignore())
                .ForMember(s => s.LetterOfGoodStandings, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerPersalDetails, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerRetirements, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayer>(s.RolePlayerId));

            CreateMap<BodyCollector, client_BodyCollector>()
                .ForMember(a => a.RolePlayer, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<client_Person, Person>()
                 .ForMember(a => a.PassportNumber, opt => opt.Ignore())
                 .ForMember(a => a.IsBeneficiary, opt => opt.Ignore())
                 .ReverseMap()
                 .ForMember(a => a.RolePlayer, opt => opt.Ignore())
                 .ConstructUsing(s => MapperExtensions.GetEntity<client_Person>(s.RolePlayerId));

            CreateMap<client_RolePlayerBankingDetail, RolePlayerBankingDetail>()
                .ForMember(t => t.BankName, opt => opt.Ignore())
                .ForMember(t => t.IsForeign, opt => opt.Ignore())
                .ForMember(t => t.BankBranchName, opt => opt.Ignore())
                .ForMember(t => t.AccountType, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerBankingDetail>(s.RolePlayerBankingId));

            CreateMap<client_RolePlayerNote, Note>()
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.RolePlayerId))
                .ForMember(t => t.Id, opt => opt.MapFrom(s => s.RolePlayerNoteId))
                .ReverseMap()
                .ForMember(t => t.RolePlayerNoteId, opt => opt.MapFrom(s => s.Id))
                .ForMember(t => t.RolePlayerId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerNote>(s.Id));

            CreateMap<client_RolePlayerNote, RolePlayerNote>()
                .ReverseMap()
                .ForMember(t => t.RolePlayer, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerNote>(s.RolePlayerNoteId));

            CreateMap<client_RolePlayerAddress, RolePlayerAddress>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerAddress>(s.RolePlayerAddressId));

            CreateMap<PreviousInsurerRolePlayer, client_PreviousInsurerRolePlayer>()
               .ForMember(s => s.RolePlayer, opt => opt.Ignore())
               .ForMember(s => s.PreviousInsurer, opt => opt.Ignore())
               .ReverseMap();

            CreateMap<RolePlayerType, client_RolePlayerType>()
                .ForMember(s => s.RolePlayerRelations, opt => opt.Ignore())
                .ForMember(s => s.PolicyInsuredLives, opt => opt.Ignore())
                .ForMember(s => s.FuneralInsuredTypes, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<RolePlayerPolicy, policy_Policy>()
                .ForMember(s => s.CategoryInsuredCovers, opt => opt.Ignore())
                .ForMember(s => s.Covers, opt => opt.Ignore())
                .ForMember(s => s.QuoteV2, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerPolicyDeclarations, opt => opt.Ignore())
                .ForMember(a => a.ProductOption, opt => opt.MapFrom(d => d.ProductOption))
                .ForMember(s => s.PolicyInsuredLives, opt => opt.Ignore())
                .ForMember(s => s.PolicyInvoices, opt => opt.Ignore())
                .ForMember(s => s.Benefits, opt => opt.Ignore())
                .ForMember(s => s.Brokerage, opt => opt.Ignore())
                .ForMember(s => s.JuristicRepresentative, opt => opt.Ignore())
                .ForMember(s => s.Representative, opt => opt.Ignore())
                .ForMember(s => s.PolicyOwner, opt => opt.Ignore())
                .ForMember(s => s.PolicyPayee, opt => opt.Ignore())
                .ForMember(s => s.PolicyMovement, opt => opt.Ignore())
                .ForMember(s => s.ParentPolicy, opt => opt.Ignore())
                .ForMember(s => s.Policies, opt => opt.Ignore())
                .ForMember(s => s.Insurer, opt => opt.Ignore())
                .ForMember(s => s.ReinstateReason, opt => opt.Ignore())
                .ForMember(s => s.AnnualIncreases, opt => opt.Ignore())
                .ForMember(s => s.PremiumPaybacks, opt => opt.Ignore())
                .ForMember(s => s.PolicyContactOverrides, opt => opt.Ignore())
                .ForMember(s => s.PolicyChangeProducts, opt => opt.Ignore())
                .ForMember(s => s.PolicyStatusChangeAudits, opt => opt.Ignore())
                .ForMember(s => s.InsurerGroupSchemeAccesses, opt => opt.Ignore())
                .ForMember(s => s.PolicyContacts, opt => opt.Ignore())
                .ForMember(s => s.PolicyDocumentCommunicationMatrices, opt => opt.Ignore())
                .ForMember(s => s.TenantId, opt => opt.MapFrom(d =>
                    d.TenantId == 0
                        ? 1
                        : d.TenantId))
                .ForMember(s => s.RolePlayerRelations, opt => opt.Ignore())
                .ForMember(s => s.PolicyChangeProducts, opt => opt.Ignore())
                .ForMember(s => s.PolicyProductDeviations, opt => opt.Ignore())
                .ForMember(s => s.PolicyContacts, opt => opt.Ignore())
                .ForMember(s => s.PolicyDocumentCommunicationMatrices, opt => opt.Ignore())
                .ForMember(s => s.PolicyBinders, opt => opt.Ignore())
                .ForMember(s => s.PolicyDetails, opt => opt.Ignore())
                .ForMember(s => s.PolicyOptions, opt => opt.Ignore())
                .ForMember(s => s.PolicyTreaties, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.PolicyInsuredLives, opt => opt.Ignore())
                .ForMember(s => s.InsuredLives, opt => opt.Ignore())
                .ForMember(s => s.Insurer, opt => opt.Ignore())
                .ForMember(s => s.RepresentativeId,
                    opt => opt.MapFrom(d =>
                       d.PolicyBrokers.Count == 0
                            ? 0
                            : GetPolicyRepresentative(d.PolicyBrokers).RepId))
                .ForMember(s => s.JuristicRepresentativeId,
                    opt => opt.MapFrom(d =>
                        d.PolicyBrokers.Count == 0
                            ? null
                            : GetPolicyRepresentative(d.PolicyBrokers).JuristicRepId))
                .ForMember(s => s.TenantId,
                    opt => opt.MapFrom(d =>
                        d.TenantId == 0
                            ? 1
                            : d.TenantId))
                .ForMember(s => s.BrokerageId,
                    opt => opt.MapFrom(d =>
                        d.PolicyBrokers.Count == 0 ? 0 : ((List<policy_PolicyBroker>)d.PolicyBrokers)[0].BrokerageId))
                .ForMember(s => s.ContinuationEffectiveDate, opt => opt.Ignore())
                .ForMember(s => s.LapseEffectiveDate, opt => opt.Ignore())
                .ForMember(s => s.RefundType, opt => opt.Ignore())
                .ForMember(s => s.EligibleForRefund, opt => opt.Ignore())
                .ForMember(s => s.IsGroupPolicy,
                    opt => opt.MapFrom(d => d.PolicyOwner == null ? false : d.PolicyOwner.RolePlayerIdentificationType == RolePlayerIdentificationTypeEnum.Company))
                .ForMember(s => s.RefundAmount, opt => opt.Ignore())
                .ForMember(s => s.ParentPolicyNumber,
                    opt => opt.MapFrom(d => d.ParentPolicy != null ? d.ParentPolicy.PolicyNumber : null))
                .ForMember(s => s.PolicyDocumentCommunicationMatrix, opt => opt.Ignore())
                .ForMember(s => s.AdminPolicyContact, opt => opt.Ignore())
                .ForMember(s => s.BrokerPolicyContact, opt => opt.Ignore())
                .ForMember(s => s.FirstAlternativePolicyContact, opt => opt.Ignore())
                .ForMember(s => s.SecondAlternativePolicyContact, opt => opt.Ignore())
                .ForMember(s => s.ParentPolicyInceptionDate, opt => opt.Ignore());

            CreateMap<client_RolePlayerRelation, RolePlayerRelation>()
                .ReverseMap()
                .ForMember(s => s.FromRolePlayer, opt => opt.Ignore())
                .ForMember(s => s.ToRolePlayer, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerType, opt => opt.Ignore())
                .ForMember(s => s.Policy, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerRelation>(s.Id));

            CreateMap<client_RolePlayerRelationLife, RolePlayerRelationLife>()
                .ReverseMap()
                .ForMember(s => s.RolePlayerRelation, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerRelationLife>(s.RolePlayerRelationId));

            CreateMap<client_Company, Company>()
                .ForMember(s => s.EffectiveDate, opt => opt.Ignore())
                .ForMember(s => s.ContactPersonName, opt => opt.Ignore())
                .ForMember(s => s.ContactDesignation, opt => opt.Ignore())
                .ForMember(s => s.ContactTelephone, opt => opt.Ignore())
                .ForMember(s => s.ContactMobile, opt => opt.Ignore())
                .ForMember(s => s.ContactEmail, opt => opt.Ignore())
                .ForMember(s => s.FinPayeNumber, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerPolicies, opt => opt.Ignore())
                .ForMember(s => s.Code, opt => opt.Ignore())
                .ForMember(s => s.CompanyName, opt => opt.Ignore())
                .ForMember(s => s.CompanyRegNo, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.RolePlayerRetirements, opt => opt.Ignore())
                .ForMember(s => s.SchemeClassification, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<client_Company>(s.RolePlayerId));

            CreateMap<Benefit, RolePlayerBenefit>()
               .ForMember(s => s.RolePlayerName, opt => opt.Ignore())
               .ForMember(s => s.BenefitName, opt => opt.Ignore())
               .ForMember(s => s.ProductOptionName, opt => opt.Ignore())
               .ForMember(s => s.Age, opt => opt.Ignore())
               .ForMember(s => s.AgeIsYears, opt => opt.Ignore())
               .ForMember(s => s.IsStatedBenefit, opt => opt.Ignore())
               .ForMember(s => s.Selected, opt => opt.Ignore())
               .ReverseMap();


            CreateMap<medical_HealthCareProvider, HealthCareProviderModel>()
                .ReverseMap()
            .ConstructUsing(s => MapperExtensions.GetEntity<medical_HealthCareProvider>(s.RolePlayerId));

            CreateMap<client_FuneralParlor, FuneralParlor>()
                .ForMember(s => s.AddressLine1, opt => opt.Ignore())
                .ForMember(s => s.AddressLine2, opt => opt.Ignore())
                .ForMember(s => s.AddressLine3, opt => opt.Ignore())
                .ForMember(s => s.ContactNumber, opt => opt.Ignore())
                .ForMember(s => s.FuneralParlorName, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.RolePlayer, opt => opt.Ignore());

            CreateMap<client_Undertaker, Undertaker>()
                .ForMember(s => s.IdNumber, opt => opt.Ignore())
                .ForMember(s => s.PassportNumber, opt => opt.Ignore())
                .ForMember(s => s.DateOfBirth, opt => opt.Ignore())
                .ForMember(s => s.ContactNumber, opt => opt.Ignore())
                .ForMember(s => s.FirstName, opt => opt.Ignore())
                .ForMember(s => s.LastName, opt => opt.Ignore())
                .ForMember(s => s.DateOfBurial, opt => opt.Ignore())
                .ForMember(s => s.PlaceOfBurial, opt => opt.Ignore())
                .ForMember(s => s.IsValid, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.RolePlayer, opt => opt.Ignore());

            CreateMap<client_FinPayee, FinPayee>()
               .ReverseMap()
               .ForMember(s => s.RolePlayer, opt => opt.Ignore())
               .ConstructUsing(s => MapperExtensions.GetEntity<client_FinPayee>(s.RolePlayerId));


            CreateMap<client_VopdResponse, ClientVopdResponse>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_VopdResponse>(s.VopdResponseId));

            CreateMap<UserVopdResponse, client_UserVopdResponse>()
                .ReverseMap();

            CreateMap<client_RolePlayerContact, RolePlayerContact>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerContact>(s.RolePlayerContactId));

            CreateMap<client_RolePlayerContactInformation, RolePlayerContactInformation>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_RolePlayerContactInformation>(s.RolePlayerContactInformationId));

            CreateMap<client_PersonEmployment, PersonEmployment>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_PersonEmployment>(s.PersonEmpoymentId));

            CreateMap<client_SchemeClassification, SchemeClassification>()
                .ReverseMap();

            CreateMap<client_Reinsurer, Reinsurer>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<client_Reinsurer>(s.RolePlayerId));

        }

        private readonly SemaphoreSlim _locker = new SemaphoreSlim(1, 1);

        private policy_PolicyBroker GetPolicyRepresentative(ICollection<policy_PolicyBroker> policyBrokers)
        {
            policy_PolicyBroker representative;
            _locker.Wait();
            try
            {
                representative = policyBrokers.Where(r => r.EffectiveDate <= DateTimeHelper.SaNow).
                    OrderByDescending(r => r.EffectiveDate).First();
            }
            finally
            {
                _locker.Release();
            }
            return representative;
        }
    }
}
