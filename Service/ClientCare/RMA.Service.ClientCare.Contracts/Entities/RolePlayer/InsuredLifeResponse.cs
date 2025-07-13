using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class InsuredLifeResponse
    {
        public int InsuredLifeUniqueIdentifier { get; set; }
        public InsuredLifeRolePlayerTypeEnum RelationShip { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
        public DateTime DateOfBirth { get; set; }
    }
}