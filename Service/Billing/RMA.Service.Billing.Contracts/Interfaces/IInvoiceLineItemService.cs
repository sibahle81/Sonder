using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Billing.Contracts.Entities;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Billing.Contracts.Interfaces
{
    public interface IInvoiceLineItemService : IService
    {
        Task<List<InvoiceLineItem>> GetInvoiceLineItems();
        Task<InvoiceLineItem> GetInvoiceLineItem(int id);
        Task<int> AddInvoiceLineItem(InvoiceLineItem invoiceLineItem);
        Task EditInvoiceLineItem(InvoiceLineItem invoiceLineItem);
    }
}
