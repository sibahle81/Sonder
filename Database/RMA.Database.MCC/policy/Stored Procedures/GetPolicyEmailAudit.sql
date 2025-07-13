CREATE PROCEDURE [campaign].[GetPolicyEmailAudit]
	@policyId int
AS BEGIN

	select ca.*
	from policy.Policy p (nolock)
		inner join campaign.EmailAudit ca (nolock) on
			left(ca.ItemType, 6) = 'Policy' and 
			ca.ItemId = p.PolicyId
	where p.PolicyId = @policyId 
	  and ca.IsDeleted = 0
	  and ca.IsSuccess = 1
	union select ca.*
	from policy.Policy p (nolock) 
		inner join claim.Claim c (nolock) on c.PolicyId = p.PolicyId
		inner join campaign.EmailAudit ca (nolock) on
			ca.ItemType in ('Member', 'RolePlayer') and
			ca.ItemId = p.PolicyOwnerId
	where p.PolicyId = @policyId 
	  and ca.IsDeleted = 0 
	  and ca.IsSuccess = 1
	union select ca.*
	from policy.Policy p (nolock) 
		inner join claim.Claim c (nolock) on c.PolicyId = p.PolicyId
		inner join campaign.EmailAudit ca (nolock) on
			ca.ItemType = 'Claim' and
			ca.ItemId = c.ClaimId
	where p.PolicyId = @policyId 
	  and ca.IsDeleted = 0 
	  and ca.IsSuccess = 1
	union select ca.*
	from policy.Policy p (nolock) 
		inner join claim.Claim c (nolock) on c.PolicyId = p.PolicyId
		inner join campaign.EmailAudit ca (nolock) on
			ca.ItemType = 'PersonEvent' and
			ca.ItemId = c.PersonEventId
	where p.PolicyId = @policyId 
	  and ca.IsDeleted = 0 
	  and ca.IsSuccess = 1
	union select ca.*
	from policy.Policy p (nolock) 
		inner join payment.Payment pm (nolock) on pm.PolicyId = p.PolicyId
		inner join campaign.EmailAudit ca (nolock) on
			ca.ItemType in ('Payment') and
			ca.ItemId = pm.PaymentId
	where p.PolicyId = @policyId
	  and ca.IsDeleted = 0
	  and ca.IsSuccess = 1
	order by 1 desc

END
