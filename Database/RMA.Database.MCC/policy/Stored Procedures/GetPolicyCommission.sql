CREATE PROCEDURE [policy].[GetPolicyCommission] @wizardId int = null, @policyId int = null
AS BEGIN

	if isnull(@wizardId, 0) > 0 begin
		select @policyId = LinkedItemId from bpm.Wizard (nolock) where Id = @wizardId
	end

	SELECT  
        sum(CASE WHEN (
                ((case when( (CASE WHEN crt.[Name] = 'Child' THEN 22 ELSE 75 END) -
                (DATEDIFF(year, case when crt.[Name] = 'Child' then  commission.GetYoungestChildDOB(pp.PolicyId ) else cp.DateOfBirth end, pp.PolicyInceptionDate) + 1)) < 10 and crt.[Name] != 'Child'
		then 10 else
			((CASE WHEN crt.[Name] = 'Child' THEN 22 ELSE 75 END) -
						(DATEDIFF(year, case when crt.[Name] = 'Child' then  commission.GetYoungestChildDOB(pp.PolicyId ) else cp.DateOfBirth end, pp.PolicyInceptionDate) + 1)) end))
            ) *
            (pil.premium) * 0.0325 * 12 < 
            (pil.premium * 0.85 * 12)
            THEN 
            (
                ((case when( (CASE WHEN crt.[Name] = 'Child' THEN 22 ELSE 75 END) -
                (DATEDIFF(year, case when crt.[Name] = 'Child' then  commission.GetYoungestChildDOB(pp.PolicyId ) else cp.DateOfBirth end, pp.PolicyInceptionDate) + 1)) < 10 and crt.[Name] != 'Child'
		then 10 else
			((CASE WHEN crt.[Name] = 'Child' THEN 22 ELSE 75 END) -
						(DATEDIFF(year, case when crt.[Name] = 'Child' then  commission.GetYoungestChildDOB(pp.PolicyId ) else cp.DateOfBirth end, pp.PolicyInceptionDate) + 1)) end))
            ) *
            (pil.premium) * 0.0325 * 12
            ELSE
            (pil.premium) * 0.85 * 12
        END)
     AS 'PRIMARY COMMISSION',

    
    sum( (pil.premium) * 0.85 * 12)
    AS 'FYC 85%',
	sum((
                ((case when( (CASE WHEN crt.[Name] = 'Child' THEN 22 ELSE 75 END) -
                (DATEDIFF(year, case when crt.[Name] = 'Child' then  commission.GetYoungestChildDOB(pp.PolicyId ) else cp.DateOfBirth end, pp.PolicyInceptionDate) + 1)) < 10 and crt.[Name] != 'Child'
		then 10 else
			((CASE WHEN crt.[Name] = 'Child' THEN 22 ELSE 75 END) -
						(DATEDIFF(year, case when crt.[Name] = 'Child' then  commission.GetYoungestChildDOB(pp.PolicyId ) else cp.DateOfBirth end, pp.PolicyInceptionDate) + 1)) end))
            ) *
            (pil.premium) * 0.0325 * 12)
     AS 'LTC 3.25%'

	FROM policy.Policy (NOLOCK) pp
		INNER JOIN policy.PolicyLifeExtension (NOLOCK) ple ON ple.PolicyId = pp.PolicyId 
		INNER JOIN policy.PolicyInsuredLives (NOLOCK) pil ON pil.PolicyId = pp.PolicyId
		INNER JOIN [client].[Person] (NOLOCK) cp ON cp.RolePlayerId = pil.RolePlayerId
		INNER JOIN [client].[RolePlayerType] (NOLOCK) crt ON crt.RolePlayerTypeId = pil.RolePlayerTypeId
		INNER JOIN broker.Representative (NOLOCK) br ON pp.RepresentativeId = br.Id
		INNER JOIN Client.Person (NOLOCK) ccp ON ccp.RolePlayerId = pp.PolicyOwnerId
		INNER JOIN product.ProductOption (NOLOCK) po ON pp.ProductOptionId = po.Id
	WHERE pp.PolicyId = @policyId;

END
