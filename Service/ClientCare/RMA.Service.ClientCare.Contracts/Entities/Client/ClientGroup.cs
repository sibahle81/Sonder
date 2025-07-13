using RMA.Common.Entities;

using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class ClientGroup : AuditDetails
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string RegistrationNumber { get; set; }
        public int? AddressId { get; set; }
        public DateTime DateViewed { get; set; }
    }
}