CREATE PROCEDURE [security].[GetHealthCareProvidersLinkedToUserEmail]
	@Email As VARCHAR(500)
AS
	BEGIN
		SELECT DISTINCT
			u.Id [UserId],
			hcp.RolePlayerId AS HealthCareProviderId,
			hcp.[Name],
			hcp.PracticeNumber,
			0 'CompCareMSPId',
			u.TenantId
		FROM [security].[UserHealthCareProviderMap]
			 (NOLOCK) userHCPmap 
			INNER JOIN [security].[User] (NOLOCK) u ON u.Id = userHCPmap.UserId
			INNER JOIN [medical].[HealthCareProvider] (NOLOCK) hcp ON userHCPmap.HealthCareProviderId = hcp.RolePlayerId
		WHERE
			u.Email = @Email
			AND u.IsActive = 1
			AND userHCPmap.IsDeleted = 0
			AND userHCPmap.isActive = 1
		ORDER BY hcp.Name
	END
GO