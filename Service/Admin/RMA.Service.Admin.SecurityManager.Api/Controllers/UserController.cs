using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using ILastViewedService = RMA.Service.Admin.SecurityManager.Contracts.Interfaces.ILastViewedService;
using UserInfo = RMA.Service.Admin.SecurityManager.Contracts.Entities.UserInfo;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.SecurityManager.Api.Controllers
{

    public class UserController : RmaApiController
    {
        private readonly ILastViewedService _lastViewedService;
        private readonly IUserService _userService;
        private readonly IRoleService _roleService;
        private readonly IAuthenticationService _authenticationService;
        public UserController(IUserService userService, ILastViewedService lastViewedService, IRoleService roleService, IAuthenticationService authenticationService)
        {
            _userService = userService;
            _lastViewedService = lastViewedService;
            _roleService = roleService;
            _authenticationService = authenticationService;
        }

        // GET: clc/api/Product/Product/Search/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}
        [HttpGet("Search/{permissionFilter}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<User>>> SearchUsers(string permissionFilter, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var permissionList = !string.IsNullOrEmpty(permissionFilter) ? JsonConvert.DeserializeObject<List<string>>(permissionFilter) : new List<string>();
            var users = await _userService.SearchUsers(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), permissionList);
            return Ok(users);
        }

        // GET sec/api/User/ByPermission/{permission}
        [HttpGet("ByPermission/{permission}")]
        public async Task<ActionResult<IEnumerable<User>>> SearchUsersByPermission(string permission)
        {
            var users = await _userService.SearchUsersByPermission(permission);
            return Ok(users);
        }

        // GET sec/api/User/ByPermission/{permission}//{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}
        [HttpGet("SearchUsersPermissionPageRequest/{permissionFilter}/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<IEnumerable<User>>> SearchUsersPermissionPageRequest(string permissionFilter, int page = 1, int pageSize = 5, string orderBy = "Id", string sortDirection = "asc", string query = "")
        {
            var users = await _userService.SearchUsersPermissionPageRequest(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"), permissionFilter);
            return Ok(users);
        }

        // GET: sec/api/User/SearchUserByEmail/{email}
        [HttpGet("SearchUserByEmail/{email}")]
        public async Task<ActionResult<User>> SearchUserByEmail(string email)
        {
            var user = await _userService.SearchUserByEmail(email);
            return Ok(user);
        }

        // GET sec/api/User/LastViewed
        [HttpGet("LastViewed")]
        public async Task<ActionResult<IEnumerable<User>>> UserLastViewed()
        {
            var users = await _lastViewedService.GetLastViewedUsers();
            return Ok(users);
        }

        // GET sec/api/User/ByToken/{token}
        [HttpGet("ByToken/{token}")]
        public async Task<ActionResult<User>> GetUserByToken(Guid token)
        {
            var user = await _userService.GetUserByToken(token);
            return Ok(user);
        }

        // GET sec/api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> Get()
        {
            var users = await _userService.GetUsers();
            return Ok(users);
        }

        // GET sec/api/User/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(int id)
        {
            var user = await _userService.GetUserById(id);
            return Ok(user);
        }

        // GET sec/api/User/ByEmail/{email}
        [HttpGet("ByEmail/{email}")]
        public async Task<ActionResult<User>> ByEmail(string email)
        {
            var user = await _userService.GetUserByEmail(email);
            return Ok(user);
        }

        // GET sec/api/User/ByUsername/{username}
        [HttpGet("ByUsername/{username}")]
        public async Task<ActionResult<User>> GetUserByUsername(string username)
        {
            var user = await _userService.GetUserByUsername(username);
            return Ok(user);
        }

        //POST: sec/api/User/add/{user}
        [HttpPost]
        public async Task<ActionResult<int>> Post(User user)
        {
            var id = await _userService.AddUser(user);
            return Ok(id);
        }

        //PUT: sec/api/User/{user}
        [HttpPut]
        public async Task<ActionResult<User>> Put(User user)
        {
            var result = await _userService.EditUser(user);
            return Ok(result);
        }

        //POST: sec/api/User/UpdateLoginFailedAttempts/{user}
        [HttpPost("UpdateLoginFailedAttempts")]
        public async Task<ActionResult<User>> UpdateLoginFailedAttempts(User user)
        {
            var userModel = await _userService.UpdateLoginFailedAttempts(user?.Email);
            return Ok(userModel);
        }

        //POST: sec/api/User/ChangePassword/{userRequest}
        [HttpPost("ChangePassword")]
        public async Task<ActionResult<int>> ChangePassword(UserRequest userRequest)
        {
            var result = await _userService.ChangePassword(userRequest?.user.Email, userRequest.OldPassword,
                userRequest.user.Password);
            return Ok(result);
        }

        //PUT: sec/api/User/ApproveUser/{user}
        [HttpPut("ApproveUser")]
        public async Task<ActionResult> ApproveUser(User user)
        {
            await _userService.ApproveUser(user);
            return Ok();
        }

        //todo this is to be changed so the userService changes their own password and not generated and sent
        //PUT: sec/api/User/ResetPassword/{user}
        [HttpPut("ResetPassword")]
        public async Task<ActionResult> ResetPassword(User user)
        {
            await _authenticationService.GeneratePasswordResetToken(user?.Email);
            return Ok();
        }

        // GET sec/api/User/SearchUsersByRole/{ids}
        [HttpGet("SearchUsersByRole/{ids}")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsersInRole(string ids)
        {
            if (!string.IsNullOrEmpty(ids))
            {
                var roleIds = ids.Split(',').Select(int.Parse).ToList();
                var users = await _userService.GetUsersInRoles(roleIds);
                return Ok(users);
            }
            return Ok(new List<User>());

        }

        [HttpGet("SearchUsersByRoleName/{roleName}")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsersByRoleName(string roleName)
        {
            var users = await _userService.GetUsersByRoleName(roleName);
            return Ok(users);
        }

        [HttpGet("GetRoles")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetRoles()
        {
            var roles = await _roleService.GetRoles();
            return Ok(roles);
        }

        [HttpGet("GetTenants")]
        public async Task<ActionResult<IEnumerable<Lookup>>> GetTenants()
        {
            var roles = await _userService.GetTenants();
            return Ok(roles);
        }

        [HttpGet("Info")]
        public async Task<ActionResult<IEnumerable<UserInfo>>> GetUserInfo()
        {
            var userInfo = await _userService.GetUserInfo();
            return Ok(userInfo);
        }

        [HttpGet("IsUserActive/{username}")]
        public async Task<ActionResult<bool>> IsUserActive(string username)
        {
            var userInfo = await _userService.GetUserIsActive(username);
            return Ok(userInfo);
        }

        [HttpGet("HasPermission/{username}/{permissionName}")]
        public async Task<ActionResult<bool>> HasPermission(string username, string permissionName)
        {
            var userInfo = await _userService.HasPermission(username, permissionName);
            return Ok(userInfo);
        }

        [HttpGet("GetHealthCareProvidersLinkedToUser/{email}")]
        public async Task<ActionResult<List<UserHealthCareProvider>>> GetHealthCareProvidersLinkedToUser(string email)
        {
            var userInfo = await _userService.GetHealthCareProvidersLinkedToUser(email);
            return Ok(userInfo);
        }

        [HttpGet("GetHealthCareProvidersForInternalUser/{searchString}")]
        public async Task<ActionResult<List<UserHealthCareProvider>>> GetHealthCareProvidersForInternalUser(string searchString)
        {
            var userInfo = await _userService.GetHealthCareProvidersForInternalUser(searchString);
            return Ok(userInfo);
        }

        [HttpPost("SaveUserHealthCareProviders/{userId}")]
        public async Task<ActionResult<bool>> SaveUserHealthCareProviders(int userId, [FromBody] List<UserHealthCareProvider> userHealthcareProviders)
        {
            var userInfo = await _userService.SaveUserHealthCareProviders(userHealthcareProviders, userId);
            return Ok(userInfo);
        }


        [AllowAnonymous]
        [HttpGet("SearchUserByEmailAnon/{email}")]
        public async Task<ActionResult<User>> SearchUserByEmailAnon(string email)
        {
            var user = await _userService.SearchUserByEmail(email);
            return Ok(user);
        }

        [HttpPost("GetUserLinkedToHealthCareProviderId/{healthCareProviderId}")]
        public async Task<ActionResult<User>> GetUserLinkedToHealthCareProviderId(int healthCareProviderId)
        {
            var userDetails = await _userService.GetUserLinkedToHealthCareProviderId(healthCareProviderId);
            return Ok(userDetails);
        }

        [HttpGet("GetPagedUserCompanyMap/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<UserCompanyMap>>> GetPagedUserCompanyMap(int page = 1, int pageSize = 5, string orderBy = "createdDate", string sortDirection = "desc", string query = "")
        {
            var result = await _userService.GetPagedUserCompanyMap(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(result);
        }

        [HttpPost("AddUserCompanyMap")]
        public async Task<ActionResult<int>> AddUserCompanyMap([FromBody] UserCompanyMap userCompanyMap)
        {
            var id = await _userService.AddUserCompanyMap(userCompanyMap);
            return Ok(id);
        }

        [HttpPut("EditUserCompanyMap")]
        public async Task<ActionResult<bool>> EditUserCompanyMap([FromBody] UserCompanyMap userCompanyMap)
        {
            await _userService.EditUserCompanyMap(userCompanyMap);
            return Ok(true);
        }

        [HttpPut("EditUserContact")]
        public async Task<ActionResult<bool>> EditUserContact([FromBody] UserContact userContact)
        {
            await _userService.EditUserContact(userContact);
            return Ok(true);
        }

        [HttpGet("GetUserContact/{userId}")]
        public async Task<ActionResult<UserContact>> GetUserContact(int userId)
        {
            var userContact = await _userService.GetUserContact(userId);
            return Ok(userContact);
        }

        [HttpPost("AddUserContact")]
        public async Task<ActionResult<int>> AddUserContact([FromBody] UserContact userContact)
        {
            var id = await _userService.AddUserContact(userContact);
            return Ok(id);
        }

        [HttpGet("GetLinkedMember/{userId}")]
        public async Task<ActionResult<int>> GetLinkedMember(int userId)
        {
            var result = await _userService.GetLinkedMember(userId);
            return Ok(result);
        }

        [HttpGet("GetUserCompanyMaps/{userId}")]
        public async Task<ActionResult<List<UserCompanyMap>>> GetUserCompanyMaps(int userId)
        {
            var result = await _userService.GetUserCompanyMaps(userId);
            return Ok(result);
        }

        [HttpGet("GetPendingUserCompanyMaps/{companyId}/{userActivationId}")]
        public async Task<ActionResult<List<UserCompanyMap>>> GetPendingUserCompanyMaps(int companyId, int userActivationId)
        {
            var result = await _userService.GetPendingUserCompanyMaps(companyId, userActivationId);
            return Ok(result);
        }

        [HttpGet("GetUsersByBrokerageId/{brokerId}")]
        public async Task<ActionResult<List<User>>> GetUsersByBrokerageId(int brokerId)
        {
            var result = await _userService.GetUsersByBrokerageId(brokerId);
            return Ok(result);
        }

        [HttpGet("GetHealthCareProviderIdLinkedToExternalUser/{userId}")]
        public async Task<ActionResult<UserHealthCareProvider>> GetHealthCareProviderLinkedToExternalUser(int userId)
        {
            var healthCareProviderId = await _userService.GetHealthCareProviderIdLinkedToExternalUser(userId);
            return Ok(healthCareProviderId);
        }

        [HttpGet("GetPagedUserHealthCareProviderMap/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<UserHealthCareProvider>>> GetPagedLinkedUserMembers(int page = 1, int pageSize = 5, string orderBy = "CreatedDate", string sortDirection = "asc", string query = "")
        {
            var healthCareProviderUsers = await _userService.GetPagedUserHealthCareProviderMap(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "asc"));
            return Ok(healthCareProviderUsers);
        }

        [HttpGet("SearchUsersByPermissions/{permissionFilter}")]
        public async Task<ActionResult<List<User>>> SearchUsersByPermissions(string permissionFilter)
        {
            var permissionList = !string.IsNullOrEmpty(permissionFilter) ? JsonConvert.DeserializeObject<List<string>>(permissionFilter) : new List<string>();
            var healthCareProviderId = await _userService.SearchUsersByPermissions(permissionList);
            return Ok(healthCareProviderId);
        }

        [HttpGet("GetPagedRoles/{page}/{pageSize}/{orderBy}/{sortDirection}/{query?}")]
        public async Task<ActionResult<PagedRequestResult<Role>>> GetPagedRoles(int page = 1, int pageSize = 5, string orderBy = "createdDate", string sortDirection = "desc", string query = "")
        {
            var result = await _userService.GetPagedRoles(new PagedRequest(query, page, pageSize, orderBy, sortDirection == "desc"));
            return Ok(result);
        }

        [HttpPost("GetPagedUsers")]
        public async Task<ActionResult<PagedRequestResult<User>>> GetPagedUsers([FromBody] UserSearchRequest userSearchRequest)
        {
            var results = await _userService.GetPagedUsers(userSearchRequest);
            return Ok(results);
        }

        [HttpGet("GetRole/{roleId}")]
        public async Task<ActionResult<Role>> GetRole(int roleId)
        {
            var result = await _userService.GetRole(roleId);
            return Ok(result);
        }
    }
}