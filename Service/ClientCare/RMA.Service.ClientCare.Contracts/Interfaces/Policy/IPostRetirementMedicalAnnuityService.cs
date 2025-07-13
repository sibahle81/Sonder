using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
  public  interface IPostRetirementMedicalAnnuityService : IService
   {
        Task<bool> ProcessPaymentResponse(int invoiceHeaderId, InvoiceStatusEnum invoiceStatus);
   }
}
