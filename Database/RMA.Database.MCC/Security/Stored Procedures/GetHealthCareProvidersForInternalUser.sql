

CREATE PROCEDURE [security].[GetHealthCareProvidersForInternalUser]
	@SearchCriteria As VARCHAR(500)
AS
	
	--Declare @SearchCriteria As VARCHAR(500)
	--Set @SearchCriteria = 'zon'
	BEGIN
		SELECT DISTINCT
			hcp.RolePlayerId AS HealthCareProviderId,
			hcp.[Name],
			hcp.PracticeNumber,
			ccmap.CompCareMSPId
		FROM [medical].[HealthCareProvider]
			 (NOLOCK) hcp 
			INNER JOIN [mapping].[HealthCareProviderCompCareMap] ccmap ON ccmap.HealthCareProviderId = hcp.RolePlayerId
		WHERE
			hcp.[Name] like '%' + @SearchCriteria + '%' OR hcp.PracticeNumber like '%' + @SearchCriteria + '%'
		ORDER BY hcp.Name
	END