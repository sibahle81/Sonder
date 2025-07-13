namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MISwitchBatchDeleteReason
    {
        public int Id { get; set; } // Id (Primary key)
        public string Description { get; set; } // Description (length: 255)
        public bool IsActive { get; set; } // IsActive
        public bool SendRemittance { get; set; } // SendRemittance
    }
}
