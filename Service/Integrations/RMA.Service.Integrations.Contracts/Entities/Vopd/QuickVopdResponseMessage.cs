namespace RMA.Service.Integrations.Contracts.Entities.Vopd
{
    public class QuickVopdResponseMessage
    {
        public string message { get; set; }
        public string statusCode { get; set; }
        public VopdResponseMessage VerificationResponse { get; set; }
    }
}
