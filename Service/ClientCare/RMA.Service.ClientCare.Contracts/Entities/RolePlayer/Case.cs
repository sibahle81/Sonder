using RMA.Service.ClientCare.Contracts.Entities.Broker;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class Case
    {
        public string Code { get; set; }
        public int CaseTypeId { get; set; }
        public string ClientReference { get; set; }
        public RolePlayer MainMember { get; set; }
        public List<RolePlayer> Spouse { get; set; }
        public List<RolePlayer> Children { get; set; }
        public List<RolePlayer> ExtendedFamily { get; set; }
        public List<RolePlayer> Beneficiaries { get; set; }
        public int RepresentativeId { get; set; }
        public int BrokerageId { get; set; }
        public int ProductId { get; set; }
        public int? JuristicRepresentativeId { get; set; }
        public Representative Representative { get; set; }
        public Brokerage Brokerage { get; set; }
        public Representative JuristicRepresentative { get; set; }
        public RolePlayer NewMainMember { get; set; }

        public Case()
        {
            MainMember = new RolePlayer();
            Spouse = new List<RolePlayer>();
            Children = new List<RolePlayer>();
            ExtendedFamily = new List<RolePlayer>();
            Beneficiaries = new List<RolePlayer>();
            Representative = new Representative();
            Brokerage = new Brokerage();
            JuristicRepresentative = new Representative();
        }
    }
}
