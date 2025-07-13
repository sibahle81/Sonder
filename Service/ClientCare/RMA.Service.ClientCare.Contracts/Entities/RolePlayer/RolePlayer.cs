using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.Member;
using RMA.Service.Integrations.Contracts.Entities.Vopd;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayer
    {
        public int RolePlayerId { get; set; }
        public string DisplayName { get; set; }
        public string TellNumber { get; set; }
        public string CellNumber { get; set; }
        public string EmailAddress { get; set; }
        public int? PreferredCommunicationTypeId { get; set; }
        public RolePlayerIdentificationTypeEnum RolePlayerIdentificationType { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public System.DateTime ModifiedDate { get; set; }
        public int CaseTypeId { get; set; }
        public int? RepresentativeId { get; set; }
        public int? AccountExecutiveId { get; set; }
        public int ProductId { get; set; }
        public int PolicyId { get; set; }
        public Company Company { get; set; }
        public List<RolePlayerBankingDetail> RolePlayerBankingDetails { get; set; }
        public List<RolePlayerAddress> RolePlayerAddresses { get; set; }
        public Person Person { get; set; }
        public Informant Informant { get; set; }
        public Claimant Claimant { get; set; }
        public HealthCareProviderModel HealthCareProvider { get; set; }
        public ForensicPathologist ForensicPathologist { get; set; }
        public FuneralParlor FuneralParlor { get; set; }
        public Undertaker Undertaker { get; set; }
        public BodyCollector BodyCollector { get; set; }
        public List<Note> RolePlayerNotes { get; set; }
        public List<RolePlayerRelation> FromRolePlayers { get; set; }
        public List<RolePlayerRelation> ToRolePlayers { get; set; }
        public List<RolePlayerBenefit> Benefits { get; set; }
        public List<RolePlayerPolicy> Policies { get; set; }
        public List<RolePlayerPolicy> PolicyPayees { get; set; }
        public FinPayee FinPayee { get; set; }
        public decimal TotalCoverAmount { get; set; }
        public string KeyRoleType { get; set; }
        public DateTime? JoinDate { get; set; }
        public List<PolicyInsuredLife> PolicyInsuredLives { get; set; }
        public List<VopdResponse> VopDResponse { get; set; }
        public InsuredLifeRemovalReasonEnum? InsuredLifeRemovalReason { get; set; }
        public DateTime? EndDate { get; set; }
        public List<PreviousInsurerRolePlayer> PreviousInsurerRolePlayers { get; set; }
        public List<RolePlayerContact> RolePlayerContacts { get; set; }
        public List<Declaration> Declarations { get; set; }
        public RolePlayerBenefitWaitingPeriodEnum? RolePlayerBenefitWaitingPeriod { get; set; }
        public ClientTypeEnum? ClientType { get; set; }
        public MemberStatusEnum MemberStatus { get; set; } = MemberStatusEnum.ActiveWithoutPolicies;

        public bool HasActiveCoidPolicies { get; set; }
        public bool HasActiveVapsPolicies { get; set; }
        public bool HasActiveFuneralPolicies { get; set; }

        public override string ToString()
        {
            return $"{RolePlayerId} - {DisplayName.ToUpper()}";
        }
    }
}
