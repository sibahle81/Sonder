using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;

using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TinyCsvParser;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class DiscountFileListingFacade : RemotingStatelessService, IDiscountFileListingService
    {
        private const char commaDelimiter = ',';
        private const char pipeDelimiter = '|';

        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<Load_DiscountFile> _discountFileRepository;
        private readonly IRepository<Load_DiscountFileListing> _discountFileListingRepository;

        public DiscountFileListingFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<Load_DiscountFile> discountFileRepository,
            IRepository<Load_DiscountFileListing> discountFileListingRepository
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _discountFileRepository = discountFileRepository;
            _discountFileListingRepository = discountFileListingRepository;
        }

        public async Task<List<string>> ImportDiscountFileListing(string fileName, FileContentImport content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }

            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            var errors = new List<string>();
            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var companyIndex = fileData.IndexOf("LOCATION_DESC", StringComparison.Ordinal);

            if (companyIndex != -1)
            {
                fileData = fileData.Substring(companyIndex);
            }

            const char commaDelimiter = ',';
            const string newLine = "\n";

            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new DiscountListingMapping();
            var csvParser = new CsvParser<Load_DiscountFileListing>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            var fileIdentifier = Guid.NewGuid();
            var healthCarePractitioner = string.Empty;
            var discountFileListings = new List<Load_DiscountFileListing>();

            var rowNumber = 2; // First line containing data in the spreadsheet.
            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    errors.Add($"Error on line {rowNumber} column {record.Error.ColumnIndex}: {record.Error.Value}");
                }
                var discountFileListingData = record.Result;



                discountFileListingData.FileIdentifier = fileIdentifier;
                discountFileListings.Add(discountFileListingData);
                rowNumber++;
            }

            if (errors.Count > 0)
            {
                return errors;
            }

            // Import the records in the background
            await SaveDiscountFileDetails(fileIdentifier, fileName);
            _ = Task.Run(() => ImportDiscountFileListingRecords(fileIdentifier, discountFileListings));

            return errors;
        }

        private async Task SaveDiscountFileDetails(Guid fileIdentifier, string fileName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var file = new Load_DiscountFile
                {
                    FileIdentifier = fileIdentifier,
                    FileName = fileName,
                    IsDeleted = false,
                    CreatedBy = RmaIdentity.Email,
                    CreatedDate = DateTime.Now,
                    ModifiedBy = RmaIdentity.Email,
                    ModifiedDate = DateTime.Now
                };
                _discountFileRepository.Create(file);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        private async Task ImportDiscountFileListingRecords(Guid fileIdentifier, List<Load_DiscountFileListing> discountFileListings)
        {
            if (discountFileListings.Count > 0)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    try
                    {
                        string sql;
                        const int importCount = 500;
                        while (discountFileListings.Count > 0)
                        {
                            var count = discountFileListings.Count >= importCount ? importCount : discountFileListings.Count;
                            var records = discountFileListings.GetRange(0, count);
                            foreach (var record in records)
                            {
                                sql = GetDiscountFileListingSql(record, records.IndexOf(record));
                                await _discountFileListingRepository.ExecuteSqlCommandAsync(sql);
                            }
                            discountFileListings.RemoveRange(0, count);
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.LogException(ex.Message);
                    }
                }
            }
        }

        private string GetDiscountFileListingSql(Load_DiscountFileListing record, int rowCount)
        {
            if (record != null)
            {

                var sql = "INSERT INTO [Load].[DiscountFileListing] ([FileIdentifier],[HealthCarePractitioner],[TakPrc],[AccPer],[AccountNumber],[PatientInitials],[PatientName],[MedicalAidCode],[MedicalAidName]"
               + ",[MedicalAidNumber],[LosAuthCode],[MedicalAidPlan],[TrackingNumber],[SwitchRef],[BatchNumber],[AdmDate],[DisDate],[RenDate],[LastRenDate]"
               + ",[DateDelivered],[DateReceived],[DateSent],[AccountTotal],[OutstandingBalance],[PharmacyTotal],[ReceiptTotal],[ReceiptDate],[ReceiptNumber]"
               + ",[BatchNo],[BatchType],[PrivateAmount],[BenefitAmount],[FinalBenefitAmount],[PatType],[ArrServProvider],[DeliveredReceipt],[RenderedToReceipt]"
               + ",[LastRenderedToReceipt],[DateSend],[DaysCalculated],[DiscountPercentage],[Discount],[HCPInvoiceNumber],[HCPAccountNumber],[RMAInvoiceNumber]"
               + ",[ExcelRowNumber],[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate]) VALUES";

                sql += string.Format("({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15},{16},{17},{18},{19},{20},{21},{22},{23},{24},{25},{26},{27},{28},{29},{30},{31},{32},{33},{34},{35},{36},{37},{38},{39},{40},{41},{42},{43},{44},{45},{46},{47},{48},{49},{50})",
                    record.FileIdentifier.ToString().Quoted(),
                    SetLength(record.HealthCarePractitioner, 150).Quoted(),//10
                    SetLength(record.TakPrc, 64).Quoted(),
                    SetLength(record.AccPer, 64),
                    SetLength(record.AccountNumber, 64),
                    SetLength(record.PatientInitials, 64).Quoted(),
                    SetLength(record.PatientName, 50).Quoted(),
                    SetLength(record.MedicalAidCode, 50).Quoted(),
                    SetLength(record.MedicalAidName, 64).Quoted(),
                    SetLength(record.MedicalAidNumber, 64).Quoted(),
                    SetLength(record.LosAuthCode, 64).Quoted(),
                    SetLength(record.MedicalAidPlan, 64).Quoted(),
                    SetLength(record.TrackingNumber, 128).Quoted(),
                    SetLength(record.SwitchRef, 50).Quoted(),
                    SetLength(record.BatchNumber, 50).Quoted(),
                    SetLength(record.AdmDate, 50).Quoted(),
                    SetLength(record.DisDate, 50).Quoted(),
                    SetLength(record.RenDate, 50).Quoted(),
                    SetLength(record.LastRenDate, 32).Quoted(),
                    SetLength(record.DateDelivered, 50).Quoted(),
                    SetLength(record.DateReceived, 50).Quoted(),
                    SetLength(record.DateSent, 50).Quoted(),//10
                    SetLength(record.AccountTotal, 50).Quoted(),
                    SetLength(record.OutstandingBalance, 50).Quoted(),
                    SetLength(record.PharmacyTotal, 32).Quoted(),
                    SetLength(record.ReceiptTotal, 64).Quoted(),
                    SetLength(record.ReceiptDate, 64).Quoted(),
                    SetLength(record.ReceiptNumber, 128).Quoted(),
                    SetLength(record.BatchNo, 64).Quoted(),
                    SetLength(record.BatchType, 50).Quoted(),
                    SetLength(record.PrivateAmount, 64).Quoted(),
                    SetLength(record.BenefitAmount, 64).Quoted(),//10
                    SetLength(record.FinalBenefitAmount, 50).Quoted(),
                    SetLength(record.PatType, 64).Quoted(),
                    SetLength(record.ArrServProvider, 50).Quoted(),
                    SetLength(record.DeliveredReceipt, 64).Quoted(),
                    SetLength(record.RenderedToReceipt, 64).Quoted(),
                    SetLength(record.LastRenderedToReceipt, 50).Quoted(),
                    SetLength(record.DateSend, 64).Quoted(),
                    SetLength(record.DaysCalculated, 50).Quoted(),
                    SetLength(record.DiscountPercentage, 64).Quoted(),
                    SetLength(record.Discount, 64).Quoted(),//10
                    SetLength(record.HcpInvoiceNumber, 50).Quoted(),
                    SetLength(record.HcpAccountNumber, 50).Quoted(),
                    SetLength(record.RmaInvoiceNumber, 64).Quoted(),
                    SetLength(rowCount.ToString(), 64).Quoted(),
                    SetLength(false.ToString(), 50).Quoted(),
                    SetLength(RmaIdentity.Email, 50).Quoted(),
                    SetLength(DateTimeHelper.SaNow.ToString(), 64).Quoted(),
                    SetLength(RmaIdentity.Email, 50).Quoted(),
                    SetLength(DateTimeHelper.SaNow.ToString(), 64).Quoted()
                );
                sql = sql.TrimEnd(new char[] { ',' });
                return sql;
            }
            return string.Empty;
        }

        private string SetLength(string value, int len)
        {
            value = value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }

        public async Task<DiscountFile> GetDiscountFilesUploaded()
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var discountFiles = await _discountFileRepository.Where(s => !s.IsDeleted).ToListAsync();

                return Mapper.Map<DiscountFile>(discountFiles);
            }
        }

        public async Task<PagedRequestResult<DiscountFileListing>> GetPagedDiscountFileListings(PagedRequest request, Guid fileIdentifier)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var discountFileListings = await _discountFileListingRepository.Where(c => c.FileIdentifier == fileIdentifier).ToListAsync();

                var data = Mapper.Map<List<DiscountFileListing>>(discountFileListings);

                return new PagedRequestResult<DiscountFileListing>
                {
                    Data = data,
                    RowCount = discountFileListings.Count,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    PageCount = (int)Math.Ceiling(discountFileListings.Count / (double)request.PageSize)
                };
            }
        }


    }
}

