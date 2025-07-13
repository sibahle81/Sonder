using AspNet.Security.OpenIdConnect.Primitives;

using Microsoft.AspNetCore.Mvc.ModelBinding;

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RMA.Web.Login.Models
{
    public class AuthorizeViewModel
    {
        [Display(Name = "Application")]
        public string ApplicationName { get; set; }

        [BindNever]
        public IEnumerable<KeyValuePair<string, OpenIdConnectParameter>> Parameters { get; set; }

        [Display(Name = "Scope")]
        public string Scope { get; set; }
    }
}
