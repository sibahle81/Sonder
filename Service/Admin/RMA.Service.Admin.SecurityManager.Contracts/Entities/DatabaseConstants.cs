namespace RMA.Service.Admin.SecurityManager.Contracts.Entities
{
    public static class DatabaseConstants
    {
        public const string GenerateMemberApprovalTask = "security.GenerateMemberApprovalTask @Data";
        public const string GetHealthCareProvidersLinkedToUserEmail = "security.GetHealthCareProvidersLinkedToUserEmail @Email";
        public const string GetCompcareUsersLinkedToEmailAddress = "security.GetCompcareUsersLinkedToEmailAddress @Email";
        public const string GetUserPermissions = "security.GetUserPermissions @UserId";
        public const string InsertUpdateUserPermissions = "security.InsertUpdateUserPermission @UserId , @PermissionId , @IsActive , @IsDeleted , @ModifiedBy";
        public const string ProcessBulkSmsRequestPerBatch = "campaign.ProcessBulkSmsRequestPerBatch";
        public const string GetHealthCareProvidersForInternalUser = "security.GetHealthCareProvidersForInternalUser @SearchCriteria";
    }
}
