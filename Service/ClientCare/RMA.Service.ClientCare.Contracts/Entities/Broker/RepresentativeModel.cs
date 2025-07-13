using System;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class RepresentativeModel
    {
        //Base type
        public string Title { get; set; }
        public string Initials { get; set; }
        public string FirstName { get; set; }
        public string SurnameOrCompanyName { get; set; }
        public string IdNumber { get; set; }
        public DateTime DateOfAppointment { get; set; }
        public string Code { get; set; } // Code (length: 50)
        public string ContactNumber { get; set; } // ContactNumber (length: 50)
        public string Email { get; set; } // Email (length: 150)
    }
}