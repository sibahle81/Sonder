using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerGroupPolicy
    {
        public int CaseTypeId { get; set; }
        public string Code { get; set; }
        public int ParentPolicyId { get; set; }
        public string ParentPolicyNumber { get; set; }
        public DateTime PolicyInceptionDate { get; set; }
        public string ClientReference { get; set; }
        public string CompanyName { get; set; }
        public int ProductOptionId { get; set; }

        public RolePlayer MainMember { get; set; }
        public List<RolePlayer> Spouse { get; set; }
        public List<RolePlayer> Children { get; set; }
        public List<RolePlayer> ExtendedFamily { get; set; }
        public List<RolePlayer> Beneficiaries { get; set; }

    }
}
