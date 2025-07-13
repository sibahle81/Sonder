using AutoMapper;
using AutoMapper.QueryableExtensions;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.Database.Constants;
using RMA.Service.ClientCare.Database.Entities;
using RMA.Service.ClientCare.Mappers;

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using TinyCsvParser;
using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Services.Policy
{
    public class PremiumListingFileAuditFacade : RemotingStatelessService, IPremiumListingFileAuditService
    {
        private readonly IRepository<policy_PremiumListingFileAudit> _premiumListingFileRepository;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<policy_PolicyInsuredLife> _policyInsuredLifeRepository;
        private readonly IRepository<Load_PremiumListing> _premiumListingRepository;
        private readonly IPremiumListingErrorAuditService _premiumListingErrorAuditService;
        private readonly IConfigurationService _configurationService;
        private readonly ISendEmailService _sendEmailService;

        private int clientReferenceNumber;
        private const char commaDelimiter = ',';
        private const char pipeDelimiter = '|';

        public PremiumListingFileAuditFacade(StatelessServiceContext context,
          IDbContextScopeFactory dbContextScopeFactory,
          IRepository<policy_PremiumListingFileAudit> premiumListingFileRepository,
          IPremiumListingErrorAuditService premiumListingErrorAuditService,
           IRepository<Load_PremiumListing> premiumListingRepository,
            IConfigurationService configurationService,
            ISendEmailService sendEmailService,
           IRepository<policy_PolicyInsuredLife> policyInsuredLifeRepository)
          : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _premiumListingFileRepository = premiumListingFileRepository;
            _premiumListingRepository = premiumListingRepository;
            _policyInsuredLifeRepository = policyInsuredLifeRepository;
            _premiumListingErrorAuditService = premiumListingErrorAuditService;
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
        }

        public async Task<List<PremiumListingFileAudit>> GetPremiumListingFileAudits()
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var premiumListingAudits = await _premiumListingFileRepository
                    .Where(x => x.Id > 0)
                    .ProjectTo<PremiumListingFileAudit>().ToListAsync();
                return Mapper.Map<List<PremiumListingFileAudit>>(premiumListingAudits);
            }
        }

        public async Task<List<PremiumListingFileAudit>> GetPremiumListingFileAuditsByBrokerEmail(string email)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var premiumListingAudits = await _premiumListingFileRepository
                    .Where(x => x.CreatedBy == email)
                    .ProjectTo<PremiumListingFileAudit>().ToListAsync();
                return Mapper.Map<List<PremiumListingFileAudit>>(premiumListingAudits);
            }
        }

        public async Task<PremiumListingFileAudit> GetPremiumListingFileAudit(int id)
        {
            using (_dbContextScopeFactory.Create())
            {
                var premiumListingAudit = await _premiumListingFileRepository
                    .SingleAsync(pol => pol.Id == id,
                        $"Could not find premium listing file with id {id}");

                return Mapper.Map<PremiumListingFileAudit>(premiumListingAudit);
            }
        }

        public async Task<int> AddPremiumListingFileAudit(PremiumListingFileAudit premiumListingFileAudit)
        {
            Contract.Requires(premiumListingFileAudit != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<policy_PremiumListingFileAudit>(premiumListingFileAudit);
                _premiumListingFileRepository.Create(entity);
                await scope.SaveChangesAsync()
                    .ConfigureAwait(false);
                return entity.Id;
            }
        }

        public async Task EditPremiumListingFileAudit(PremiumListingFileAudit premiumListingFileAudit)
        {
            Contract.Requires(premiumListingFileAudit != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataCrossRef = await _premiumListingFileRepository
                    .Where(x => x.Id == premiumListingFileAudit.Id)
                    .ToListAsync();
                foreach (var crossRef in dataCrossRef)
                {
                    crossRef.PremiumListingStatus = premiumListingFileAudit.PremiumListingStatus;
                    _premiumListingFileRepository.Update(crossRef);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task UpdatePremiumListingStatusByFileIdentifier(string fileIdentifier, PremiumListingStatusEnum status)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var dataCrossRef = await _premiumListingFileRepository
                    .Where(x => fileIdentifier.Contains(x.FileHash))
                    .ToListAsync();
                foreach (var crossRef in dataCrossRef)
                {
                    crossRef.PremiumListingStatus = status;
                    _premiumListingFileRepository.Update(crossRef);
                }
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<int> BrokerImportPremiumListing(FileContentImport content)
        {
            if (content == null)
            {
                throw new NullReferenceException("File content cannot be null");
            }

            if (string.IsNullOrEmpty(content.Data))
            {
                throw new NullReferenceException("File content cannot be null");
            }

            clientReferenceNumber = 0;
            var decodedString = Convert.FromBase64String(content.Data);
            const int StartingIndex = 0;
            var fileData = Encoding.UTF8.GetString(decodedString, StartingIndex, decodedString.Length);
            var companyIndex = fileData.IndexOf("Company", StringComparison.Ordinal);

            if (companyIndex != -1)
            {
                fileData = fileData.Substring(companyIndex);
            }

            const char commaDelimiter = ',';
            const string newLine = "\n";
            int returned = 0;
            int _returned = 0;

            var csvParserOptions = new CsvParserOptions(true, commaDelimiter);
            var csvMapper = new PremiumListingMapping();
            var csvParser = new CsvParser<Load_PremiumListing>(csvParserOptions, csvMapper);
            var csvReaderOptions = new CsvReaderOptions(new[] { newLine });
            var records = csvParser.ReadFromString(csvReaderOptions, fileData).ToList();

            foreach (var item in records)
            {
                if (item.Result != null)
                {
                    if (item.Result.DateOfBirth.Length < 8 && (item.Result.DateOfBirth.Length > 0))
                    {
                        string day = new string(item.Result.DateOfBirth.SkipWhile(c => c != '/')
                                          .Skip(1)
                                          .TakeWhile(c => c != '/')
                                          .ToArray()).Trim();

                        string month = new string(item.Result.DateOfBirth
                                                   .TakeWhile(c => c != '/')
                                                   .ToArray()).Trim();

                        if (month.Length == 1)
                        {
                            month = "0" + month;
                        }

                        if (day.Length == 1)
                        {
                            day = "0" + day;
                        }

                        item.Result.DateOfBirth = month + "/" + day + item.Result.DateOfBirth.Substring(item.Result.DateOfBirth.Length - 3);
                    }
                }
            }

            var fileIdentifier = Guid.NewGuid();
            var company = string.Empty;
            var premiumListings = new List<Load_PremiumListing>();

            var rowNumber = 5; // First line containing data in the spreadsheet.
            foreach (var record in records)
            {
                if (!record.IsValid)
                {
                    var line = record.Error.UnmappedRow;
                    var message = GetValidationMessage(line, rowNumber, record.Error);
                    throw new Exception(message);
                };
                if (String.IsNullOrEmpty(record.Result.ClientType)) continue;
                var premiumListingData = record.Result;
                if (string.IsNullOrEmpty(company)) company = premiumListingData.Company;
                premiumListingData.ClientReference = Regex.Replace(premiumListingData.ClientReference.Trim(), "[^A-Za-z0-9]+", "");
                premiumListingData.FileIdentifier = fileIdentifier;
                premiumListingData.Company = company;
                premiumListingData.ExcelRowNumber = rowNumber.ToString();
                premiumListings.Add(premiumListingData);
                rowNumber++;
            }
            returned = premiumListings.Count;
            _returned = returned;
            // Import the records in the background
            var res = await ImportPremiumListingRecords(company, fileIdentifier, premiumListings, content.UserId);

            if (res > 0)
            {
                _returned = 0;
                var premiumListingFileAudit = new PremiumListingFileAudit();
                premiumListingFileAudit.FileName = content.FileName;
                premiumListingFileAudit.FileHash = Convert.ToString(fileIdentifier);
                premiumListingFileAudit.PremiumListingStatus = PremiumListingStatusEnum.Failed;
                await AddPremiumListingFileAudit(premiumListingFileAudit);
            }
            else
            {
                var premiumListingFileAudit = new PremiumListingFileAudit();
                premiumListingFileAudit.FileName = content.FileName;
                premiumListingFileAudit.FileHash = Convert.ToString(fileIdentifier);
                premiumListingFileAudit.PremiumListingStatus = PremiumListingStatusEnum.AwaitingApproval;
                await AddPremiumListingFileAudit(premiumListingFileAudit);
                await SendPremiumListingDocumentByEmail(decodedString, company, content.FileName);
            }
            return _returned;
        }

        private string GetValidationMessage(string line, int rowNumber, CsvMappingError error)
        {
            var values = line.Split(new char[] { commaDelimiter });
            if (values.Length == 1 && line.IndexOf(pipeDelimiter) >= 0)
            {
                values = line.Split(new char[] { pipeDelimiter });
            }
            if (values.Length == 1)
            {
                return "Invalid file delimiter found. Please check file structure";
            }
            else if (values.Length != 6)
            {
                return $"All the required data has not been supplied on line {rowNumber}.";
            }
            return $"Error on line {rowNumber} column {error.ColumnIndex}: {error.Value}";
        }

        private async Task<int> SendPremiumListingDocumentByEmail(byte[] premiumListingFile, string company, string fileName)
        {
            var _fromAddress =
                await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);

            var _toAddress =
                await _configurationService.GetModuleSetting(SystemSettings.PremiumListingEmailReceiver);

            var _name = new string(fileName.TakeWhile(c => c != '.').ToArray()).Trim();
            var attachments = new List<MailAttachment>
            {
                new MailAttachment
                {
                    AttachmentByteData = premiumListingFile,
                    FileName = _name + ".csv",
                    FileType = "application/csv"
                },
            };

            var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.PremiumListingEmailTemplate));

            var result = await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = 0,
                ItemType = "Premium Listing",
                FromAddress = _fromAddress,
                Recipients = _toAddress,
                RecipientsCC = null,
                Subject = $"Premium Listing: {company}",
                Body = emailBody.Replace("{0}", "Admin")
                    .Replace("{1}", company),
                IsHtml = true,
                Attachments = attachments.ToArray()
            });

            return result;
        }

        private async Task<int> ImportPremiumListingRecords(string company, Guid fileIdentifier, List<Load_PremiumListing> premiumListings, int UserId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                string sql;
                const int importCount = 500;
                while (premiumListings.Count > 0)
                {
                    var count = premiumListings.Count >= importCount ? importCount : premiumListings.Count;
                    var records = premiumListings.GetRange(0, count);
                    sql = GetPremiumListingSql(records);
                    await _policyInsuredLifeRepository.ExecuteSqlCommandAsync(sql);
                    premiumListings.RemoveRange(0, count);
                }
                var data = await _premiumListingRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier));

                await RunValidations(fileIdentifier, UserId);
                var errors = await _premiumListingErrorAuditService.GetPremiumListingErrorAudits(Convert.ToString(fileIdentifier));
                if (data != null && (errors.Count == 0))
                {
                    await CreateWizardTask(company, fileIdentifier);
                }

                return errors.Count;
            }
        }

        private async Task RunValidations(Guid fileIdentifier, int userId)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                await _policyInsuredLifeRepository.ExecuteSqlCommandAsync(DatabaseConstants.ValidatePremiumListingRecords,
                   new SqlParameter("@fileIdentifier", fileIdentifier),
                   new SqlParameter("@UserId", userId));
            }
        }

        private string GetPremiumListingSql(List<Load_PremiumListing> records)
        {
            var sql = "INSERT INTO [Load].[PremiumListing] ([FileIdentifier],[Company],[PolicyNumber],[ClientReference],[JoinDate],[ClientType],[FirstName],[Surname],[MainMemberID],[IdNumber],[PassportNumber],[DateOfBirth],[BenefitName],[Address1],[Address2],[City],[Province],[Country],[PostalCode],[PostalAddress1],[PostalAddress2],[PostalCity],[PostalProvince],[PostalCountry],[PostalPostCode],[Telephone],[Mobile],[Email],[PreferredCommunication], [PreviousInsurer], [PreviousInsurerStartDate], [PreviousInsurerEndDate], [PreviousInsurerPolicyNumber],[ExcelRowNumber]) values";
            foreach (var rec in records)
            {
                if (rec.ClientType.Equals("Main Member", StringComparison.OrdinalIgnoreCase))
                {
                    clientReferenceNumber++;
                }
                var clientReference = String.IsNullOrEmpty(rec.ClientReference) ? $"XXX{clientReferenceNumber:000000000}" : rec.ClientReference;
                sql += string.Format("('{0}',{1},'{2}','{3}','{4}','{5}',{6},{7},'{8}','{9}','{10}','{11}',{12},{13},{14},{15},{16},{17},{18},{19},{20},{21},{22},{23},{24},{25},{26},{27},{28},{29},{30},{31},{32},{33}),",
                    rec.FileIdentifier,
                    SetLength(rec.Company, 256).Quoted(),
                    SetLength(rec.PolicyNumber, 64).TrimText(),
                    SetLength(clientReference, 64),
                    SetLength(rec.JoinDate, 32),
                    SetLength(rec.ClientType, 32).TrimText(),
                    SetLength(rec.FirstName, 256).Quoted(),
                    SetLength(rec.Surname, 256).Quoted(),
                    SetLength(rec.MainMemberId, 32),
                    SetLength(rec.IdNumber, 32).TrimText(),
                    SetLength(rec.PassportNumber, 32).TrimText(),
                    SetLength(rec.DateOfBirth, 32).TrimText(),
                    SetLength(rec.BenefitName, 64).Quoted(),
                    SetLength(rec.Address1, 256).Quoted(),
                    SetLength(rec.Address2, 256).Quoted(),
                    SetLength(rec.City, 256).Quoted(),
                    SetLength(rec.Province, 256).Quoted(),
                    SetLength(rec.Country, 256).Quoted(),
                    SetLength(rec.PostalCode, 8).Quoted(),
                    SetLength(rec.PostalAddress1, 256).Quoted(),
                    SetLength(rec.PostalAddress2, 256).Quoted(),
                    SetLength(rec.PostalCity, 256).Quoted(),
                    SetLength(rec.PostalProvince, 256).Quoted(),
                    SetLength(rec.PostalCountry, 256).Quoted(),
                    SetLength(rec.PostalPostCode, 8).Quoted(),
                    SetLength(rec.Telephone, 24).Quoted(),
                    SetLength(rec.Mobile, 24).Quoted(),
                    SetLength(rec.Email, 128).Quoted(),
                    SetLength(rec.PreferredCommunication, 24).Quoted(),
                    SetLength(rec.PreviousInsurer, 256).Quoted(),
                    SetLength(rec.PreviousInsurerStartDate, 32).Quoted(),
                    SetLength(rec.PreviousInsurerEndDate, 32).Quoted(),
                    SetLength(rec.PreviousInsurerPolicyNumber, 50).Quoted(),
                    SetLength(rec.ExcelRowNumber, 50).Quoted()
                );
            }
            sql = sql.TrimEnd(new char[] { ',' });
            return sql;
        }

        private string SetLength(string value, int len)
        {
            value = value.Trim();
            return value.Length > len ? value.Substring(0, len) : value;
        }

        private async Task CreateWizardTask(string company, Guid fileIdentifier)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var companyParameter = new SqlParameter { ParameterName = "@COMPANY", Value = company };
                var fileIdentifierParameter = new SqlParameter { ParameterName = "@FILEIDENTIFIER", Value = fileIdentifier };
                var dateParameter = new SqlParameter { ParameterName = "@DATE", Value = DateTime.Today.ToString("yyyy-MM-dd") };
                var versionParameter = new SqlParameter { ParameterName = "@VERSION", Value = 2 };
                var userParameter = new SqlParameter { ParameterName = "@USER", Value = RmaIdentity.Email };

                await this._policyInsuredLifeRepository.ExecuteSqlCommandAsync(
                    "[policy].[MemberPortalPremiumListingTask] @COMPANY, @FILEIDENTIFIER, @DATE, @VERSION, @USER",
                        companyParameter,
                        fileIdentifierParameter,
                        dateParameter,
                        versionParameter,
                        userParameter
                );
            }
        }

        public async Task<string> GetPolicyNumber(Guid fileIdentifier)
        {
            using (this._dbContextScopeFactory.CreateReadOnly())
            {
                var data = await _premiumListingRepository
                    .FirstOrDefaultAsync(s => s.FileIdentifier.Equals(fileIdentifier)
                                           && !string.IsNullOrEmpty(s.PolicyNumber));
                return data.PolicyNumber;
            }
        }
    }
}
