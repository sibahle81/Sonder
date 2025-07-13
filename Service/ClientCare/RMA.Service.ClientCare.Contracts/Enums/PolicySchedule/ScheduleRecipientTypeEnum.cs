using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Enums
{
     public enum ScheduleRecipientTypeEnum
    {
        PolicyMember = 0,
        Broker = 1,
        Admin = 2,
        Scheme = 3,
        PolicyOwner = 4,
        Group =5,
        Other = 6

    }


    public enum PolicyCommunicationTypeEnum
    {
       NewOnboarding = 0,
       PolicyAmendment = 1,       
       Other = 3

    }
}
