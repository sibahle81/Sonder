using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Entities.CFP
{
    public class EmployerDetails
    {
        public string Employer { get; set; } = "";
        public string EmployeeNumber { get; set; }
        public string Department { get; set; } = "";
    }
}
