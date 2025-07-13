namespace RMA.Service.ClaimCare.Contracts.Entities
{
    using System.ComponentModel.DataAnnotations;

    public class FileUpload
    {
        [Required]
        public string FileName { get; set; }

        [Required]
        public string FileContent { get; set; }
    }
}
