CREATE PROCEDURE claim.GetReferralTypeLimitConfiguration
AS
BEGIN

   SELECT
		ReferralTypeLimitConfigurationId,
		ReferralTypeId,
		limit,
		PermissionName
	FROM
		[claim].[ReferralTypeLimitConfiguration]
	WHERE
		PermissionName IN (
			SELECT
				p.Name
			FROM
				[security].[Permission] p
				JOIN [security].[PermissionGroup] pg ON pg.Id = p.PermissionGroupId
			WHERE
				pg.name = 'Claim Limits'
    );
END