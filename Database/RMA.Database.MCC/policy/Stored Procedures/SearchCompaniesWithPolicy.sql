
--Gram Letoaba
--2022/10/10

CREATE PROCEDURE [policy].[SearchCompaniesWithPolicy]
    @Filter VARCHAR(50),
	@ShowActive bit = 1,
	@pageNumber int=0,
	@pageSize int =5,
	@recordCount int Output

AS
BEGIN
    SET @Filter = RTRIM(LTRIM(@Filter))
	IF(@Filter != NULL)
	BEGIN
		select 
			distinct rp.DisplayName AS DisplayName,
					 p.PolicyId
		from [policy].[Policy] p
		inner join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
		inner join [client].[roleplayer] rp on rp.RolePlayerId = paPol.policyOwnerId
		where rp.[RolePlayerIdentificationTypeId] = 2
		AND rp.DisplayName like '%' + @Filter+ '%' 
		ORDER BY p.PolicyId desc  OFFSET (@pageNumber* @pageSize) rows FETCH NEXT @pageSize rows ONLY	


		Select @recordCount = count (p.PolicyId)
		from [policy].[Policy] p
		inner join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
		inner join [client].[roleplayer] rp on rp.RolePlayerId = paPol.policyOwnerId
		where rp.[RolePlayerIdentificationTypeId] = 2
		AND rp.DisplayName like '%' + @Filter+ '%' 
	END
	IF(@Filter = NULL)
	BEGIN
		select 
			distinct rp.DisplayName AS DisplayName,
					 p.PolicyId
		from [policy].[Policy] p
		inner join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
		inner join [client].[roleplayer] rp on rp.RolePlayerId = paPol.policyOwnerId
		where rp.[RolePlayerIdentificationTypeId] = 2
		ORDER BY p.PolicyId desc  OFFSET (@pageNumber* @pageSize) rows FETCH NEXT @pageSize rows ONLY

		Select @recordCount = count (p.PolicyId)
		from [policy].[Policy] p
		inner join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
		inner join [client].[roleplayer] rp on rp.RolePlayerId = paPol.policyOwnerId
		where rp.[RolePlayerIdentificationTypeId] = 2
	END
END