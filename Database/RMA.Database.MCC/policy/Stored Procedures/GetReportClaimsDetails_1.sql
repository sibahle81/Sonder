CREATE   PROCEDURE [policy].[GetReportClaimsDetails]
AS BEGIN

select co.[Name] [SchemeName],
	p.[PolicyNumber] [ParentPolicyNumber],
	c.[PolicyNumber] [ChildPolicyNumber],
	cl.[PersonEventId],
	cl.[ClaimReferenceNumber],
	cs.[Name] [ClaimStatus],
	cl.[CreatedBy],
	cl.[CreatedDate],
	cl.[ModifiedBy],
	cl.[ModifiedDate],
	lrp.[DisplayName] [InsuredLife],
	crp.[DisplayName] [Claimant],
	ci.[InvoiceAmount] [ClaimAmount],
	ci.[AuthorisedAmount] [PaidAmount],
	cis.[Name] [InvoiceStatus],
	per.[DateOfDeath]
from [client].[Company] co (nolock)
	inner join [policy].[Policy] p (nolock) on p.[PolicyOwnerId] = co.[RolePlayerId]
	inner join [policy].[Policy] c (nolock) on c.[ParentPolicyId] = p.[PolicyId]
	inner join [claim].[Claim] cl (nolock) on cl.[PolicyId] = c.[PolicyId]
	inner join [claim].[ClaimStatus] cs (nolock) on cs.[ClaimStatusId] = cl.[ClaimStatusId]
	inner join [claim].[PersonEvent] pe (nolock) on pe.[PersonEventId] = cl.[PersonEventId]
	inner join [client].[RolePlayer] lrp (nolock) on lrp.[RolePlayerId] = pe.[InsuredLifeId]
	inner join [client].[RolePlayer] crp (nolock) on crp.[RolePlayerId] = pe.[ClaimantId]
	inner join [client].[Person] per (nolock) on per.[RolePlayerId] = lrp.[RolePlayerId]
	left join [claim].[ClaimInvoice] ci (nolock) on ci.[ClaimId] = cl.[ClaimId]
	left join [claim].[ClaimInvoiceStatus] cis (nolock) on cis.[ClaimInvoiceStatusId] = ci.[ClaimInvoiceStatusId]
where left(p.[PolicyNumber], 3) = '01-'
order by [SchemeName],
	[ParentPolicyNumber],
	c.[PolicyNumber]

END