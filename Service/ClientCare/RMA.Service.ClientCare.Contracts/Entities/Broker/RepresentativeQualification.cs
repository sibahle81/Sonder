namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class RepresentativeQualification
    {
        public int Id { get; set; } // Id (Primary key)
        public string QualificationCode { get; set; } // QualificationCode (length: 255)
        public int YearObtained { get; set; } // YearObtained
        public string Description { get; set; } // Description (length: 255)
    }
}
