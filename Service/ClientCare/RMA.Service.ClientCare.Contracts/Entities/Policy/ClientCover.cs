using RMA.Common.Entities;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PolicyClientCover : AuditDetails
    {
        public int ClientId { get; set; }
        public int? PolicyId { get; set; }

        public int ProductId { get; set; }

        // public int? ProductOptionId { get; set; }
        public int? BenefitSetId { get; set; }
        public int? SkillCategoryId { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime AnniversaryDate { get; set; }

        public int? NumberOfEmployees { get; set; }
        public decimal? Earnings { get; set; }
        public decimal? Premium { get; set; }
        public int? RateId { get; set; }
        public int Year { get; set; }
        public List<ClientCoverOption> ClientCoverOptions { get; set; }
    }

}