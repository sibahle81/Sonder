
CREATE PROCEDURE claim.SaveReferralTypeLimitConfiguration
	@ReferralTypeLimitConfigurationId int, 
	@ReferralTypeId int,
	@Limit decimal,
	@PermissionName varchar(50),
	@RecordCount int out
AS
BEGIN
	BEGIN TRY	
		if (select count(*) from  [claim].[ReferralTypeLimitConfiguration] where PermissionName = @PermissionName) > 0 
		begin
			SET @RecordCount = 1;
			return;
		end 
		UPDATE [security].Permission SET [Name] = @PermissionName WHERE [Name] = (SELECT PermissionName FROM [claim].[ReferralTypeLimitConfiguration] WHERE ReferralTypeLimitConfigurationId = @ReferralTypeLimitConfigurationId)
		UPDATE [claim].[ReferralTypeLimitConfiguration] SET PermissionName = @PermissionName, limit = @Limit WHERE ReferralTypeLimitConfigurationId = @ReferralTypeLimitConfigurationId;
		SET @RecordCount = 1
	END TRY
	BEGIN CATCH
		SET @RecordCount = -1;
	END CATCH
END