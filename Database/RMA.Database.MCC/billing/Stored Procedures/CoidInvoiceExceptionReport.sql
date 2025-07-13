
-- =============================================
-- Author:Mbali Mkhize
-- Create date: 2021/08/11
-- EXEC [billing].[CoidInvoiceExceptionReport] '2021-06-1', '2021-06-10',0
-- =============================================

CREATE PROCEDURE [billing].[CoidInvoiceExceptionReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
	@IndustryId int
	
AS
BEGIN
 IF @IndustryId = 0
 BEGIN
   SELECT @IndustryId = NULL;
 END

	SELECT
		ic.[Name] [Industry],
		pp.PolicyNumber,
		cfp.FinPayeNumber MemberNumber,  
		r.DisplayName MemberName, 
		bi.InvoiceDate, 
		bi.InvoiceNumber, 
		pp.InstallmentPremium as Premium
	from policy.policy pp --102053
	inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
	inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = pp.[PolicyOwnerId]
	inner join Client.FinPayee cfp (NOLOCK) on pp.[PolicyOwnerId] = cfp.RolePlayerID 
	left join [billing].[Invoice] bi on pp.PolicyId = bi.PolicyId
	left join  common.Industry ind on ind.Id = cfp.IndustryId
    left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId
	where ppo.Name like '%Coid%'
	AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
				WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
				AND ind.[Id] = ISNULL(cfp.IndustryId, ind.[Id]))
	AND bi.InvoiceNumber IS NULL
END