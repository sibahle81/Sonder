using System.Threading.Tasks;

namespace RMA.Service.Billing.DataExchange.FileExchange.Excel
{
    internal class ExcelFileExchange : FileExchangeBase
    {
        public override async Task ImportBinaryDataAsync(byte[] fileData) => await base.ImportBinaryDataAsync(fileData);
    }
}