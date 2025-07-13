using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class EmployeeOtherInsuredlifeModel
    {
        public int EmployeeRolePlayerId { get; set; } // toRolePlayerId in relation roleplayer table
        public int OtherInsureLifeRolePlayerId { get; set; } //  fromRolePlayerId in relation roleplayer table
        public RolePlayerTypeEnum Relationship { get; set; } // rolePlayerType (Spouse, Child, Niece, Nephew, Mother, Father and other)

        // otherInsureLife Roleplayer details
        public System.DateTime EffectiveDate { get; set; }
        public TitleEnum Title { get; set; }
        public string Initials { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string IdNumber { get; set; }
        public System.DateTime DateOfBirth { get; set; }
        public string TaxNumber { get; set; }
        public GenderEnum? Gender { get; set; }
        public MaritalStatusEnum MaritalStatus { get; set; }
        public IdTypeEnum IdType { get; set; }
        public NationalityEnum Nationality { get; set; }
    }
}
