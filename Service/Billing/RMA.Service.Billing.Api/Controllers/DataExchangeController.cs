using RMA.Common.Web.Controllers;
using RMA.Service.Billing.Contracts.Interfaces;

namespace RMA.Service.Billing.Api.Controllers
{
    /// <summary>
    /// This controller lives in billing for now, the controller should be shifted to the Admin or bpm services and act as an intermediary between the business rules engine and the event bus
    /// </summary>
    public class DataExchangeController : RmaApiController
    {
        private readonly IDataExchangeService _dataExchangeService; //Unable to register stateless service fabric generic services the infratructure does not cater for statefull service as of yet.
        public DataExchangeController(IDataExchangeService dataExchangeService)
        {
            _dataExchangeService = dataExchangeService;
        }
    }
}