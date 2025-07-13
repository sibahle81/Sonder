using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventStatu
    {
        public PersonEventStatu()
        {
            PersonEvents = new List<PersonEvent>();
        }

        public int Id { get; set; } // Id (Primary key)
        public string Name { get; set; } // Name (length: 255)

        public List<PersonEvent> PersonEvents { get; set; }
    }
}
