using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class OptionItem
    {
        public int OptionItemId { get; set; }
        public int OptionTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
