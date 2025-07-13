using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Linq.Dynamic;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Database.Constants;

namespace RMA.Service.Admin.MasterDataManager.Services
{
    public class ContactValidationFacade : RemotingStatelessService, IContactValidationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<common_EmailDomain> _emailDomainsRepository;
        private readonly IRepository<common_CellPhonePrefix> _cellPhonePrefixRepository;

        public ContactValidationFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<common_EmailDomain> emailDomainsRepository,
            IRepository<common_CellPhonePrefix> cellPhonePrefixRepository
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _emailDomainsRepository = emailDomainsRepository;
            _cellPhonePrefixRepository = cellPhonePrefixRepository;
        }

        private string _email;
        private string _domain;
        private bool isValidEmailFormat;
        private bool isValidDomainFormat;
        private bool wasDomainLookupPerformed;
        private bool domainNameResolved;

        private List<string> cellPhonePrefixes = new List<string>();

        public async Task<EmailInfo> ValidateEmailAddress(string emailAddress)
        {
            _email = emailAddress.Trim();

            if (string.IsNullOrWhiteSpace(_email))
                return new EmailInfo { Email = _email, Domain = "", IsValidEmailFormat = false, IsValidDomainFormat = false, WasDomainLookupPerformed = false, DomainNameResolved = false };

            _domain = GetDomainFromEmail(_email);

            isValidEmailFormat = IsValidEmailFormat(_email);
            if (!isValidEmailFormat)
                return new EmailInfo { Email = _email, Domain = "", IsValidEmailFormat = false, IsValidDomainFormat = false, WasDomainLookupPerformed = false, DomainNameResolved = false };

            isValidDomainFormat = IsValidDomainFormat(_domain);
            if (!isValidDomainFormat)
                return new EmailInfo { Email = _email, Domain = _domain, IsValidEmailFormat = isValidEmailFormat, IsValidDomainFormat = false, WasDomainLookupPerformed = false, DomainNameResolved = false };

            //First Check if domain was resolvable from db
            var domainResults = await GetDomainInfoFromDatabase(_domain);
            if (String.IsNullOrEmpty(domainResults.Domain))
            {
                IsDomainResolevable(_domain, ref wasDomainLookupPerformed, ref domainNameResolved);
                await AddDomainInfoToDatabase(_domain, isValidDomainFormat, domainNameResolved);
            }
            else
            {
                domainNameResolved = (bool)domainResults.IsResolvedDomain;
                wasDomainLookupPerformed = true;
            }

            return new EmailInfo { Email = _email, Domain = _domain, IsValidEmailFormat = isValidEmailFormat, IsValidDomainFormat = isValidDomainFormat, WasDomainLookupPerformed = wasDomainLookupPerformed, DomainNameResolved = domainNameResolved };
        }

        public async Task<List<EmailInfo>> ValidateEmailAddresses(List<string> EmailAddresses)
        {
            var emailInfos = new List<EmailInfo>();

            //Get All Domains from email list
            var domains = new List<string>();
            foreach (var emailAddress in EmailAddresses)
            {
                var email = emailAddress.Trim();
                if (string.IsNullOrWhiteSpace(email)) continue;

                var domain = GetDomainFromEmail(email);
                if (!string.IsNullOrEmpty(domain) && !domains.Contains(domain))
                    domains.Add(domain);
            }

            //Get Domain Info from DB
            var emailDomains = await GetDomainsInfoFromDatabase(string.Join(",", domains), ",");

            foreach (var emailAddress in EmailAddresses)
            {
                _email = emailAddress.Trim();

                if (string.IsNullOrWhiteSpace(_email))
                {
                    emailInfos.Add(new EmailInfo { Email = _email, Domain = "", IsValidEmailFormat = false, IsValidDomainFormat = false, WasDomainLookupPerformed = false, DomainNameResolved = false });
                    continue;
                }

                _domain = GetDomainFromEmail(_email);

                isValidEmailFormat = IsValidEmailFormat(_email);
                if (!isValidEmailFormat)
                {
                    emailInfos.Add(new EmailInfo { Email = _email, Domain = "", IsValidEmailFormat = false, IsValidDomainFormat = false, WasDomainLookupPerformed = false, DomainNameResolved = false });
                    continue;
                }

                isValidDomainFormat = IsValidDomainFormat(_domain);
                if (!isValidDomainFormat)
                {
                    emailInfos.Add(new EmailInfo { Email = _email, Domain = _domain, IsValidEmailFormat = isValidEmailFormat, IsValidDomainFormat = false, WasDomainLookupPerformed = false, DomainNameResolved = false });
                    continue;
                }

                //First Check if domain was resolvable from db
                var domainResults = emailDomains.Find(x => x.Domain == _domain);
                if (String.IsNullOrEmpty(domainResults.Domain))
                {
                    IsDomainResolevable(_domain, ref wasDomainLookupPerformed, ref domainNameResolved);
                    await AddDomainInfoToDatabase(_domain, isValidDomainFormat, domainNameResolved);
                }
                else
                {
                    domainNameResolved = (bool)domainResults.IsResolvedDomain;
                    wasDomainLookupPerformed = true;
                }

                emailInfos.Add(new EmailInfo { Email = _email, Domain = _domain, IsValidEmailFormat = isValidEmailFormat, IsValidDomainFormat = isValidDomainFormat, WasDomainLookupPerformed = wasDomainLookupPerformed, DomainNameResolved = domainNameResolved });
            }

            return emailInfos.Distinct().ToList<EmailInfo>();
        }

        public async Task<bool> IsValidMobileNumber(string mobileNumber)
        {
            if (string.IsNullOrWhiteSpace(mobileNumber))
                return false;

            string tmpCellNumber = mobileNumber.Trim().Replace(" ", "").Replace("-", "");

            #region General Validations

            if (tmpCellNumber.Replace("(", "").Replace(")", "").Replace("+","").IsNumeric() == false)
                return false; //Invalid Mobile Number (contains non-numeric characters) 

            if (tmpCellNumber.Replace("(", "").Replace(")", "").Replace("+", "").Length < 9)
                return false; // Mobile number must be at least 9 digits

            if (tmpCellNumber.Length > 15)
                return false;

            if (tmpCellNumber.Length < 9) //Any Mobile number must be at least 9 digits
                return false;

            if (tmpCellNumber.StartsWith("+", StringComparison.InvariantCultureIgnoreCase)  && tmpCellNumber.Length < 11) //when using a + then at least 1 digits after the plus sign is required Then the remaining 9 didgits
                return false;

            #endregion

            //Length 9 digits
            if (tmpCellNumber.Length == 9)
            {
                if (tmpCellNumber.StartsWith("0", StringComparison.InvariantCultureIgnoreCase))
                {
                    return false; //Invalid Mobile Number (length of 9 digits should not start with 0)
                }
                else //Missing Leading 0
                {
                    if (cellPhonePrefixes.Contains("0" + tmpCellNumber.Substring(1, 2)))
                    {
                        mobileNumber = "0" + tmpCellNumber;
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }

            cellPhonePrefixes = await Get_CellPhonePrefixes("+27");

            //Length 10 digits
            if (tmpCellNumber.Length == 10)
            {
                if (tmpCellNumber.StartsWith("0", StringComparison.InvariantCultureIgnoreCase))
                {
                    if (cellPhonePrefixes.Contains(tmpCellNumber.Substring(1, 3)))
                        return true;
                    else
                        return false;
                }
                else //Missing Leading 0
                {
                    return false;
                }
            }

            if (tmpCellNumber.StartsWith("+270", StringComparison.InvariantCultureIgnoreCase) && tmpCellNumber.Length == 13)
            {
                if (cellPhonePrefixes.Contains(tmpCellNumber.Substring(3, 3)))
                {
                    mobileNumber = (tmpCellNumber.Substring(0, 3) + tmpCellNumber.Substring(4, 9));
                    return true;
                }
                else
                {
                    return false;
                }
            }

            if (tmpCellNumber.StartsWith("270", StringComparison.InvariantCultureIgnoreCase) && tmpCellNumber.Length == 12)
            {
                if (cellPhonePrefixes.Contains(tmpCellNumber.Substring(2, 3)))
                {
                    mobileNumber = (tmpCellNumber.Substring(0, 2) + tmpCellNumber.Substring(3, 9));
                    return true;
                }
                else
                    return false;
            }

            if (tmpCellNumber.StartsWith("+27", StringComparison.InvariantCultureIgnoreCase) && tmpCellNumber.Length == 12)
            {
                if (cellPhonePrefixes.Select(x => x.Substring(1, 2)).ToList<string>().Contains(tmpCellNumber.Substring(3, 2)))
                    return true;
                else
                    return false;
            }

            if (tmpCellNumber.StartsWith("27", StringComparison.InvariantCultureIgnoreCase) && tmpCellNumber.Length == 11)
            {
                if (cellPhonePrefixes.Select(x => x.Substring(1, 2)).ToList<string>().Contains(tmpCellNumber.Substring(2, 2)))
                    return true;
                else
                    return false;
            }
            
            return true;
        }

        public async Task<List<string>> GetCellPhonePrefixes(string countryCode)
        {
            return await Get_CellPhonePrefixes(countryCode);
        }

        public async Task<List<string>> GetCellPhonePrefixesForRSA()
        {
            return await Get_CellPhonePrefixes("+27");
        }

        private async Task<List<string>> Get_CellPhonePrefixes(string countryCode = "+27")
        {
            return (await _emailDomainsRepository.SqlQueryAsync<string>(
                    DatabaseConstants.GetCellPhonePrefixes,
                    new SqlParameter { ParameterName = "@CountryCode", Value = countryCode }
                    ));
        }

        private bool IsValidDomainFormat(string domain)
        {
            string pattern = @"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.[A-Za-z]{2,6}(\.[A-Za-z]{2,6})?$";
            return Regex.IsMatch(domain, pattern);
        }

        private void IsDomainResolevable(string domain, ref bool wasDomainLookupSuccessful, ref bool isValidDomain)
        {
            try
            {
                var hostEntry = Dns.GetHostEntry(domain);

                if (hostEntry != null)
                {
                    wasDomainLookupSuccessful = true;
                    isValidDomain = true;
                }
                else
                {
                    wasDomainLookupSuccessful = true;
                    isValidDomain = false;
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("No such host is known"))
                {
                    wasDomainLookupSuccessful = true;
                    isValidDomain = false;
                }
                else
                {
                    wasDomainLookupPerformed = false;
                    isValidDomain = false;
                }
            }
        }

        private bool IsValidEmailFormat(string email)
        {
            if (email.Contains("..")) return false;

            return Regex.IsMatch(email,
                @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250));
        }

        private string GetDomainFromEmail(string email)
        {

            // Split the email into local part and domain
            string[] parts = email.Split('@');
            if (parts.Length != 2)
                return "";

            string domain = parts[1];

            // Convert the domain to Unicode using IdnMapping
            IdnMapping idn = new IdnMapping();
            string unicodeDomain = idn.GetUnicode(domain);

            return unicodeDomain;
        }

        private async Task AddDomainInfoToDatabase(string domain, bool isValidDomainFormat, bool isResolvedDomain)
        {
            if (string.IsNullOrEmpty(domain)) return;

            await _emailDomainsRepository.SqlQueryAsync(
                DatabaseConstants.AddEmailDomain,
                new SqlParameter("@domain", domain),
                new SqlParameter("@IsValidDomainFormat", isValidDomainFormat),
                new SqlParameter("@IsResolvedDomain", isResolvedDomain)
                );
        }

        private async Task<common_EmailDomain> GetDomainInfoFromDatabase(string domainName)
        {
            return (await _emailDomainsRepository.SqlQueryAsync<common_EmailDomain>(
                DatabaseConstants.GetEmailDomain,
                new SqlParameter {ParameterName = "@domain", Value = domainName}
                )).FirstOrDefault<common_EmailDomain>();
        }

        private async Task<List<common_EmailDomain>> GetDomainsInfoFromDatabase(string domains, string delimiter)
        {
            return await _emailDomainsRepository.SqlQueryAsync<common_EmailDomain>(
                        DatabaseConstants.GetEmailDomains,
                        new SqlParameter { ParameterName = "@domainslist", Value = domains },
                        new SqlParameter { ParameterName = "@delimter", Value = delimiter }
                        );
        }
    }
}