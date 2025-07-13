using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RMA.Web.Login.Models
{
    [Table("Application", Schema = "security")]
    public class Application
    {
        [Key]
        public string ApplicationID { get; set; }

        public string DisplayName { get; set; }
        public string RedirectUri { get; set; }
        public string LogoutRedirectUri { get; set; }
        public string Secret { get; set; }
        public ApplicationType ApplicationType { get; set; }
        public bool IntrospectionAllowed { get; set; }
    }

    public enum ApplicationType
    {
        Public = 1,
        Private = 2
    }
}
