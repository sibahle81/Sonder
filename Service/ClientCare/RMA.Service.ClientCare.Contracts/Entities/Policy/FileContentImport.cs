
namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class FileContentImport
    {
        public string Data { get; set; }
        public string FileName { get; set; }
        public string FileAsBase64 { get; set; }
        public int UserId { get; set; }
    }
}
