namespace RMA.Service.ClientCare.Contracts.Entities.Policy.MVP
{
    public class PolicyResponse
    {
        public string StatusCode { get; set; }
        public string Message { get; set; }
        public string ErrorCode { get; set; }

        public string RequestGUID { get; set; }
    }
}