-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [claim].[claimsPerPolicyReport]
	-- Add the parameters for the stored procedure here
	@dateFrom date, 
	@Dateto date
AS
BEGIN

	SELECT DISTINCT
		pol.policynumber,
		pol.clientreference,
		pol.policyInceptionDate,
		prodOpt.Name as ProductOptions,
		paRp.DisplayName AS [Group],
		rp.DisplayName as PolicyHolder,
		br.Name as BrokerName,
		clm.PersonEventId as ClaimNumber,
		cs.Name as ClaimStatus,
		pe.DateReceived,
		pe.DateCaptured,
		(select top 1 StartDateTime from claim.ClaimWorkflow where claimId = clm.claimId and claimstatusId = 4 order by StartDateTime desc  ) as DatePended,
		(select top 1 StartDateTime from claim.ClaimWorkflow where claimId = clm.claimId and claimstatusId = 10 order by StartDateTime desc  ) as DateRepudiated,
		clv.DateApproved,
		pmt.CreatedDate as DateAuthorised,
		DatePaid = pmt.PaymentConfirmationDate,
		CalculatedClaimAmount = cca.TotalAmount,
		AuthorisedClaimAmount = ISNULL(isnull(clv.AuthorisedAmount,InvoiceAmount),0),	
		cd.Name as DeclineReason
	FROM claim.claim clm (nolock)
		inner join claim.ClaimsCalculatedAmount cca on cca.claimId = clm.claimid
		left join claim.claiminvoice clv on clv.claimid = clm.claimid and clv.IsDeleted =0
		inner join claim.PersonEvent pe on pe.PersonEventId = clm.PersonEventId
		inner join claim.ClaimStatus cs on cs.claimstatusid = clm.claimstatusid
		inner join [policy].[Policy] pol (nolock) on pol.PolicyId = clm.PolicyId
		inner join [broker].[Brokerage] br (nolock) on br.Id = pol.brokerageId
		left join [payment].[Payment] pmt on pmt.claimid = clm.claimid and pmt.PaymentConfirmationDate is not null
		inner join [client].[roleplayer] rp on rp.RolePlayerId = pol.policyOwnerId
		left join claim.funeralInvoice finv on finv.ClaimInvoiceId = clv.ClaimInvoiceId
		left join common.claiminvoicedeclinereason cd on cd.id = finv.ClaimInvoiceDeclineReasonId
		left join [policy].[Policy] paPol (nolock) on paPol.PolicyId = pol.ParentPolicyId
		left join [client].[roleplayer] paRp on paRp.RolePlayerId = paPol.policyOwnerId
		left join [product].[ProductOption] prodOpt (nolock) on prodOpt.Id = pol.ProductOptionId
	WHERE CAST(pe.DateReceived AS DATE) BETWEEN  @dateFrom AND @Dateto
END