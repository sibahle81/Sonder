
-- =============================================
-- Author:Mbali Mkhize
-- Create date: 2021/08/13
-- EXEC [billing].[CoidPremiumReconcialationReport] '2021-06-1', '2021-06-10','INV:005120','Thula Holdings'
-- =============================================

CREATE PROCEDURE [billing].[CoidPremiumReconcialationReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
	@InvoiceNumber INT,
	@MemberNumber VARCHAR(50),
	@Amount Decimal(18,2),
	@UnderwritingYear INT
	
AS
BEGIN

 --Invoices generated

	--IF OBJECT_ID(N'tempdb..#TempInvoice', N'U') IS NOT NULL
	--		DROP TABLE #TempInvoice;

	--	SELECT DISTINCT
	--		 [InvoiceId],
	--		 [CollectionDate],
	--		 [InvoiceDate],
	--		 [PolicyId]

	--		 --FIRST_VALUE([InvoiceId]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate] DESC) AS [InvoiceId],
	--		 --FIRST_VALUE([CollectionDate]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate]  DESC) AS [CollectionDate],
	--		 --FIRST_VALUE([InvoiceDate]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate]  DESC) AS [InvoiceDate],
	--		 --FIRST_VALUE([PolicyId]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate] DESC) AS [PolicyId]

	--    --INTO #TempInvoice select *  
	--	FROM [billing].[Invoice] (NOLOCK)


	SELECT
		--ic.[Name] [Industry],
		pp.PolicyNumber,
		cfp.FinPayeNumber MemberNumber,  
		r.DisplayName MemberName, 
		bbr.ApprovalDate, 
		bi.InvoiceDate,
		bi.InvoiceNumber, 
		'' as UnderwritingYear,
		pp.InstallmentPremium as Premium
	
	--select count(*)
	from [billing].[BundleRaise] bbr (nolock) 
	inner join policy.policy pp (nolock) on bbr.policyid =pp.policyid	
	inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
	inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = pp.[PolicyOwnerId]
	inner join Client.FinPayee cfp (NOLOCK) on pp.[PolicyOwnerId] = cfp.RolePlayerID 
	left join [billing].[Invoice] bi on pp.PolicyId = bi.PolicyId
	where ppo.Name like '%Coid%'
	and bbr.ApprovalDate between  @StartDate and @EndDate 
	and bi.InvoiceNumber = @InvoiceNumber
	and cfp.FinPayeNumber =	@MemberNumber 
	--and @UnderwritingYear

END