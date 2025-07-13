using System;

namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class SwitchBatchAPIResponse
    {
        public string StatusCode { get; set; }
        public string Message { get; set; }
        public string MedicalSwitch { get; set; }
        public string FileName { get; set; }
        public string BatchNumber { get; set; }
        public DateTime DateReceived { get; set; }
        public string Content { get; set; }
    }
}
