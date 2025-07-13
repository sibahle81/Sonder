using RMA.Service.ClientCare.Contracts.Entities.Broker;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerPolicyMovement
    {
        public Brokerage FromBrokerage { get; set; }
        public Brokerage ToBrokerage { get; set; }
        public Representative FromRepresentative { get; set; }
        public Representative ToRepresentative { get; set; }
        public List<RolePlayerPolicy> Policies { get; set; }
        public Product.Product Product { get; set; }
        public DateTime EffectiveDate { get; set; }
    }
}
