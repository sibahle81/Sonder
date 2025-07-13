using System.Threading.Tasks;

namespace RMA.Service.Billing.DataExchange.FileExchange
{
    public abstract class FileExchangeBase : DataExchangeBase
    {
        protected string InputFileName { get; set; }
        protected string OutputFileName { get; set; }

        public FileExchangeBase()
        {

        }
        protected FileExchangeBase(string inputFileName)
        {
            InputFileName = inputFileName;
        }

        protected FileExchangeBase(string inputFileName, string outputFileName)
        {
            InputFileName = inputFileName;
            OutputFileName = outputFileName;
        }

        public override async Task ImportBinaryDataAsync(byte[] fileData)
        {
            await base.ImportBinaryDataAsync(fileData);
        }
    }
}