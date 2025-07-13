using AutoMapper;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;
using RMA.Service.Admin.SecurityManager.Database.Entities;
using RMA.Service.Admin.SecurityManager.Encryption;
using RMA.Service.Admin.SecurityManager.Validator;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.DirectoryServices.AccountManagement;
using System.Fabric;
using System.Linq;
using System.Security;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

using QueryableExtensions = System.Data.Entity.QueryableExtensions;

namespace RMA.Service.Admin.SecurityManager.Services
{
    public class AuthenticationFacade : RemotingStatelessService, IAuthenticationService
    {
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly IRepository<security_User> _userRepository;
        private readonly IRepository<security_Role> _roleRepository;
        private readonly IRepository<security_UserPassword> _userPasswordRepository;
        private readonly IRepository<security_PasswordResetAuthorisation> _passwordResetRepository;
        private readonly IRepository<security_LoginHistory> _loginHistoryRepository;
        private readonly IEmailSenderService _emailService;
        private readonly IConfigurationService _configurationService;
        private readonly IMapper _mapper;
        private const string DefaultHashAlgorithm = "SHA512";
        private readonly string DomainName = "rma.msft"; //TODO hardcoded        

        public AuthenticationFacade(StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            IRepository<security_Role> roleRepository,
            IRepository<security_User> userRepository,
            IRepository<security_UserPassword> userPasswordRepository,
            IRepository<security_PasswordResetAuthorisation> passwordResetRepository,
            IEmailSenderService emailService, IRepository<security_LoginHistory> loginHistoryRepository,
            IConfigurationService configurationService,
            IMapper mapper)
            : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _userRepository = userRepository;
            _userPasswordRepository = userPasswordRepository;
            _passwordResetRepository = passwordResetRepository;
            _loginHistoryRepository = loginHistoryRepository;
            _emailService = emailService;
            _roleRepository = roleRepository;
            _configurationService = configurationService;
            _mapper = mapper;
            //DomainName= await _configService.GetModuleSetting(SystemSettings.ActiveDomainDirectory);
        }

        public async Task<User> AuthenticateUser(string email, string password, string ipAddress)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                //_userRepository.DisableFilter("MultiTenancyFilter");
                var user = await _userRepository.Where(u => u.Email == email && u.IsActive)
                    .SingleOrDefaultAsync()
                    .ConfigureAwait(false);

                if (user == null) throw new SecurityException("Invalid UserName or Password");

                //Check the password
                string code = null;

                switch (user.AuthenticationType)
                {
                    case AuthenticationTypeEnum.ActiveDirectory:
                        {
                            code = CheckActiveDirectoryAuth(password, user);
                            break;
                        }
                    case AuthenticationTypeEnum.FormsAuthentication:
                        {
                            code = CheckFormsAuth(password, user);
                            break;
                        }
                }


                if (!string.IsNullOrEmpty(code))
                {
                    //Invalid Auth flow
                    user.FailedAttemptCount++;
                    user.FailedAttemptDate = DateTimeHelper.SaNow;
                    if (user.FailedAttemptCount >= 5)
                    {
                        user.IsActive = false;
                    }
                    if (!string.IsNullOrEmpty(ipAddress))
                    {
                        var loginHistory = new security_LoginHistory { Logged = DateTimeHelper.SaNow, RemoteIpAddress = ipAddress, Username = email, Reason = code, State = "Failure" };

                        _loginHistoryRepository.Create(loginHistory);
                    }

                    _userRepository.Update(user, true);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    throw new SecurityException(code);
                }

                //Valid Auth flow
                user.FailedAttemptCount = 0;
                user.FailedAttemptDate = null;
                user.IsActive = true;
                user.Token = Guid.NewGuid();

                if (!string.IsNullOrEmpty(ipAddress))
                {
                    var loginHistory = new security_LoginHistory { Logged = DateTimeHelper.SaNow, RemoteIpAddress = ipAddress, Username = email, Reason = null, State = "Success" };

                    _loginHistoryRepository.Create(loginHistory);
                }

                _userRepository.Update(user, true);
                await scope.SaveChangesAsync().ConfigureAwait(false);

                _userRepository.Load(user, u => u.UserPreferences);

                var role = _roleRepository.FirstOrDefault(r => r.Id == user.RoleId);

                var returnUser = _mapper.Map<security_User, User>(user);
                if (user?.Tenants?.Count > 0)
                    returnUser.Tenants = user.Tenants.Select(t => t.Id).ToList();
                returnUser.RoleName = role == null ? "" : role.Name;
                return returnUser;
            }
        }

        private static string CheckFormsAuth(string password, security_User user)
        {
            string code = null;
            bool isPasswordValid;
            if (string.Equals(user.HashAlgorithm, "RIJNDAEL", StringComparison.OrdinalIgnoreCase))
            {
                isPasswordValid = RijndaelEncryption.Encrypt(password) == user.Password;
            }
            else
            {
                isPasswordValid = VerifyHash(password, user.HashAlgorithm, user.Password);
            }

            if (!isPasswordValid)
            {
                code = "Invalid UserName or Password";
            }
            else if (user.HashAlgorithm != DefaultHashAlgorithm)
            {
                //Update the users password to the new Default Alog
                user.Password = ComputeHash(password, DefaultHashAlgorithm);
                user.HashAlgorithm = DefaultHashAlgorithm;
            }
            return code;
        }

        private string CheckActiveDirectoryAuth(string password, security_User user)
        {
            string code = null;
            int indexOfAt = user.Email.IndexOf('@');
            var userFromEmail = user.Email.Remove(indexOfAt);
            // Validate for AD Users

            // Login for rma AD Users
            var isPasswordValid = false;
            try
            {
                var adContext = new PrincipalContext(ContextType.Domain, DomainName);
                using (adContext)
                {
                    isPasswordValid = adContext.ValidateCredentials(userFromEmail, password);
                }

                if (!isPasswordValid)
                {
                    code = "Invalid UserName or Password";
                    user.UserName = userFromEmail;
                }
            }
            catch (Exception ex)
            {
                code = ex.Message;
                ex.LogException();
            }

            return code;
        }

        public async Task<string> GenerateAuthenticationToken()
        {
            return await Task.Run(() =>
            {
                var time = BitConverter.GetBytes(DateTimeHelper.SaNow.ToBinary());
                var key = Guid.NewGuid().ToByteArray();
                var token = RijndaelEncryption.Encrypt(Convert.ToBase64String(time.Concat(key).ToArray()));

                const string pattern = @"[\/\:\?=\+]";
                var regEx = new Regex(pattern);

                return regEx.Replace(token, "");
            });
        }

        public async Task<bool> ValidateUserToken(string username, string token)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var tokenGuid = Guid.Parse(token);
                return await QueryableExtensions
                    .AnyAsync(_userRepository.Where(user => user.Email == username && user.Token == tokenGuid))
                    .ConfigureAwait(false);
            }
        }

        public async Task<bool> VerifyUserToken(User user)
        {
            Contract.Requires(user != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var tokenGuid = Guid.Parse(user.Token);
                return await QueryableExtensions
                    .AnyAsync(_userRepository.Where(x => x.Email == user.Name && x.Token == tokenGuid))
                    .ConfigureAwait(false);
            }
        }

        public async Task<bool> ForgotPassword(string username)
        {
            await GeneratePasswordResetToken(username);
            return true;
        }

        #region Security Validation

        public async Task<bool> ChangeUserPasswordWithToken(string token, string newPassword)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (string.IsNullOrEmpty(newPassword))
                {
                    throw new ArgumentException("newPassword cannot be null", nameof(newPassword));
                }
                var passwordAuth = _passwordResetRepository.FirstOrDefault(a => a.Token == token && !a.HasExpired);
                if (passwordAuth != null)
                {
                    var user = _userRepository.FirstOrDefault(u => u.Email == passwordAuth.EmailAddress);

                    if (user == null) throw new SecurityException("SecurityTokenInvalidOrExpired");

                    if (user.AuthenticationType == AuthenticationTypeEnum.ActiveDirectory)
                    {
                        // Should never happen because an rma user cannot get a token via email
                        throw new SecurityException("AD not set to be Changed");
                    }

                    await ValidatePasswordHistory(newPassword, user.Password, user.Id, user.HashAlgorithm);

                    var valid = UpdatePassword(newPassword, user);

                    passwordAuth.HasExpired = true;
                    _passwordResetRepository.Update(passwordAuth);

                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return valid;
                }

                return false;
            }
        }

        public async Task GeneratePasswordResetToken(string userName)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                if (string.IsNullOrEmpty(userName))
                {
                    throw new SecurityException("InvalidUserName");
                }

                var user = await _userRepository.Where(a => a.Email == userName).SingleOrDefaultAsync();
                if (user == null) return;

                if (user.AuthenticationType == AuthenticationTypeEnum.FormsAuthentication)
                {
                    using (var provider = new RNGCryptoServiceProvider())
                    {
                        var data = new byte[0x10];
                        provider.GetBytes(data);
                        var token = HttpServerUtility.UrlTokenEncode(data);

                        var passwordAuth = new security_PasswordResetAuthorisation()
                        {
                            Token = token,
                            EmailAddress = userName,
                            HasExpired = false,
                            CreationDate = DateTimeHelper.SaNow

                        };
                        var emailName = string.IsNullOrEmpty(user.DisplayName) ? user.DisplayName : user.Email;
                        var mailRequest = new MailRequest
                        {
                            Recipients = new List<string> { user.Email },
                            Body = $"Hi <b>{emailName}</b>: <br> Please click on the following to" +
                                   $" <a href='{token}'>reset your password</a>",

                            FromAddress = "modtest@randmutual.co.za",//TODO hardcoded
                            IsHtml = true,
                            Subject = "Password Reset Notification"
                        };

                        await _emailService.Send(mailRequest);
                        _passwordResetRepository.Create(passwordAuth);
                    }
                }

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
        #endregion

        #region Private Methods


        private bool UpdatePassword(string newPassword, security_User user)
        {
            var validation = new PasswordValidator() { RequireDigit = true, RequiredLength = 11, RequireLowercase = true, RequireNonLetterOrDigit = true, RequireUppercase = true };

            //addService
            var passWordComplexity = validation.Validate(newPassword);

            if (passWordComplexity.Any())
            {
                throw new SecurityException(passWordComplexity.Aggregate((a, x) => a + ", " + x));
            }

            user.Password = ComputeHash(newPassword, DefaultHashAlgorithm);
            user.HashAlgorithm = DefaultHashAlgorithm;
            user.PasswordChangeDate = DateTimeHelper.SaNow;
            user.Token = null;
            user.FailedAttemptDate = null;
            user.FailedAttemptCount = 0;
            user.HashAlgorithm = DefaultHashAlgorithm;
            user.Token = null;
            user.FailedAttemptCount = 0;

            var history = new security_UserPassword { UserId = user.Id, Password = user.Password, IsActive = true };
            _userPasswordRepository.Create(history);

            _userRepository.Update(user);

            return true;

        }

        private async Task ValidatePasswordHistory(string newPassword, string oldPassword, int userId, string hashAlgorithm)
        {
            if (string.IsNullOrEmpty(oldPassword))
            {
                return;
            }
            var newPasswordIsSameAsOld = PasswordComparison(newPassword, oldPassword, hashAlgorithm);
            if (newPasswordIsSameAsOld)
            {
                throw new SecurityException("PasswordSameAsPrevious");
            }
            var passwordHistory = await _userPasswordRepository.Where(a => a.UserId == userId).OrderByDescending(a => a.CreatedDate).Take(12).ToListAsync();

            foreach (var history in passwordHistory)
            {
                if (string.IsNullOrEmpty(history.Password))
                {
                    continue;
                }
                newPasswordIsSameAsOld = PasswordComparison(newPassword, history.Password, hashAlgorithm);
                if (newPasswordIsSameAsOld)
                {
                    throw new SecurityException("PasswordHasAlreadyBeenUsed");
                }
            }
            var validation = new PasswordValidator() { RequireDigit = true, RequiredLength = 11, RequireLowercase = true, RequireNonLetterOrDigit = true, RequireUppercase = true };

            //addService
            var passWordComplexity = validation.Validate(newPassword);
            if (passWordComplexity.Any())
            {

                throw new SecurityException(passWordComplexity.Aggregate((a, x) => a + ", " + x));
            }
        }

        private static bool PasswordComparison(string newPassword, string oldPassword, string hashAlgorithm)
        {
            if (newPassword == oldPassword)
            {
                return false;
            }

            if (string.Equals(hashAlgorithm, "RIJNDAEL") && RijndaelEncryption.Encrypt(newPassword) == RijndaelEncryption.Encrypt(oldPassword))
            {
                return false;
            }
            if (VerifyHash(newPassword, hashAlgorithm, oldPassword))
            {
                return false;
            }

            return true;
        }

        private static string ComputeHash(string plainText, string hashAlgo, byte[] saltBytes = null)
        {
            // If salt is not specified, generate it on the fly.
            if (saltBytes == null)
            {
                // Define min and max salt sizes.
                const int minSaltSize = 4;
                const int maxSaltSize = 8;

                // Generate a random number for the size of the salt.
                var random = new Random();
                var saltSize = random.Next(minSaltSize, maxSaltSize);

                // Allocate a byte array, which will hold the salt.
                saltBytes = new byte[saltSize];

                // Initialize a random number generator.
                var rng = new RNGCryptoServiceProvider();

                // Fill the salt with cryptographically strong byte values.
                rng.GetNonZeroBytes(saltBytes);
            }

            // Convert plain text into a byte array.
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);

            // Allocate array, which will hold plain text and salt.
            var plainTextWithSaltBytes = new byte[plainTextBytes.Length + saltBytes.Length];

            // Copy plain text bytes into resulting array.
            for (var i = 0; i < plainTextBytes.Length; i++)
            {
                plainTextWithSaltBytes[i] = plainTextBytes[i];
            }

            // Append salt bytes to the resulting array.
            for (var i = 0; i < saltBytes.Length; i++)
            {
                plainTextWithSaltBytes[plainTextBytes.Length + i] = saltBytes[i];
            }

            // Because we support multiple hashing algorithms, we must define
            // hash object as a common (abstract) base class. We will specify the
            // actual hashing algorithm class later during object creation.
            HashAlgorithm hash;

            // Initialize appropriate hashing algorithm class.
            switch (hashAlgo.ToUpper())
            {
                case "SHA1":
                    hash = new SHA1Managed();
                    break;

                case "SHA256":
                    hash = new SHA256Managed();
                    break;

                case "SHA384":
                    hash = new SHA384Managed();
                    break;

                case "SHA512":
                    hash = new SHA512Managed();
                    break;

                default:
                    hash = new MD5CryptoServiceProvider();
                    break;
            }

            // Compute hash value of our plain text with appended salt.
            var hashBytes = hash.ComputeHash(plainTextWithSaltBytes);

            // Create array which will hold hash and original salt bytes.
            var hashWithSaltBytes = new byte[hashBytes.Length + saltBytes.Length];

            // Copy hash bytes into resulting array.
            for (var i = 0; i < hashBytes.Length; i++)
            {
                hashWithSaltBytes[i] = hashBytes[i];
            }

            // Append salt bytes to the result.
            for (var i = 0; i < saltBytes.Length; i++)
            {
                hashWithSaltBytes[hashBytes.Length + i] = saltBytes[i];
            }

            // Convert result into a base64-encoded string.
            var hashValue = Convert.ToBase64String(hashWithSaltBytes);

            // Return the result.
            return hashValue;
        }

        private static bool VerifyHash(string plainText, string hashAlgorithm, string hashValue)
        {
            // Convert base64-encoded hash value into a byte array.
            var hashWithSaltBytes = Convert.FromBase64String(hashValue);

            // We must know size of hash (without salt).

            var hashSizeInBits = 512;
            // Make sure that hashing algorithm name is specified.
            if (hashAlgorithm == null)
            {
                hashAlgorithm = string.Empty;
            }

            // Size of hash is based on the specified algorithm.
            // Convert size of hash from bits to bytes.
            var hashSizeInBytes = hashSizeInBits / 8;

            // Make sure that the specified hash value is long enough.
            if (hashWithSaltBytes.Length < hashSizeInBytes)
            {
                return false;
            }

            // Allocate array to hold original salt bytes retrieved from hash.
            var saltBytes = new byte[hashWithSaltBytes.Length - hashSizeInBytes];

            // Copy salt from the end of the hash to the new array.
            for (var i = 0; i < saltBytes.Length; i++)
            {
                saltBytes[i] = hashWithSaltBytes[hashSizeInBytes + i];
            }

            // Compute a new hash string.
            var expectedHashString = ComputeHash(plainText, hashAlgorithm, saltBytes);

            // If the computed hash matches the specified hash,
            // the plain text value must be correct.
            return hashValue == expectedHashString;
        }

        #endregion
    }

}