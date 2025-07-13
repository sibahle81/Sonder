using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerExternal
    {
        public int RolePlayerId { get; set; }
        public int RolePlayerTypeId { get; set; }
        public string CellNumber { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public IdTypeEnum IdType { get; set; }
        public string IdNumber { get; set; }
        public string PassportNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public bool IsAlive { get; set; }
        public DateTime? DateOfDeath { get; set; }
        public int CompanyRolePlayerId { get; set; }
        public string CompanyName { get; set; }
        public string MemberNumber { get; set; }
        public int? IndustryId { get; set; }
        public IndustryClassEnum? IndustryClass { get; set; }
        public string IndustryNumber { get; set; }
    }
}
