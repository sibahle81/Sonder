
-- =============================================
-- Author:Mbali Mkhize
-- Create date: 2021/08/11
-- EXEC [billing].[InvoiceExceptionReport] '2020-06-1', '2021-11-10',0,'ALL',NULL,'02-202109-118893'
-- =============================================

CREATE     PROCEDURE [billing].[InvoiceExceptionReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
	@IndustryId int,
	@ProductName VARCHAR(50),
	@MemberNumber VARCHAR(50),
	@PolicyNumber AS VARCHAR(50)
	
AS
BEGIN
 IF @IndustryId = 0
 BEGIN
   SELECT @IndustryId = NULL;
 END

 IF @ProductName = 'All'
 BEGIN
   SELECT @ProductName = NULL;
 END

 IF @MemberNumber = ''
 BEGIN
   SELECT @MemberNumber = NULL;
 END

 IF @PolicyNumber = ''
 BEGIN
   SELECT @PolicyNumber = NULL;
 END
 
 IF OBJECT_ID(N'tempdb..#TempInvoice', N'U') IS NOT NULL
			DROP TABLE #TempInvoice;

		SELECT DISTINCT
			 [InvoiceId],
			 [CollectionDate],
			 [InvoiceDate],
			 [PolicyId],
			 [InvoiceNumber],
			 [TotalInvoiceAmount],
			 [InvoiceStatusId],
			 [IsDeleted]

	    INTO #TempInvoice   
		FROM [billing].[Invoice] (NOLOCK)
		WHERE (YEAR(InvoiceDate) * 100) + (MONTH(InvoiceDate) * 1) between (YEAR(@StartDate) * 100) + (MONTH(@StartDate) * 1) AND (YEAR(@EndDate) * 100) + (MONTH(@EndDate) * 1)

	SELECT
		ic.[Name] [Industry],
		pp.PolicyNumber,
		prod.[Name] Product,
		cfp.FinPayeNumber MemberNumber,  
		r.DisplayName MemberName, 
		bi.InvoiceDate, 
		bi.InvoiceNumber, 
		pp.InstallmentPremium as Premium
	from policy.policy pp --102053
	inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
	inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = pp.[PolicyOwnerId]
	inner join Client.FinPayee cfp (NOLOCK) on pp.[PolicyOwnerId] = cfp.RolePlayerID 
	left join #TempInvoice bi on pp.PolicyId = bi.PolicyId
	left join  common.Industry ind on ind.Id = cfp.IndustryId
    left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId
	left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
	where pp.[PolicyInceptionDate] >=@StartDate
	 AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
				WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
				AND ind.[Id] = ISNULL(cfp.IndustryId, ind.[Id]))
	AND (bi.InvoiceNumber IS NULL OR bi.IsDeleted =1)
	AND (prod.[Name] = @ProductName OR @ProductName IS NULL)
	AND ( cfp.FinPayeNumber = @MemberNumber OR @MemberNumber IS NULL)
	AND (pp.PolicyNumber = @PolicyNumber or @PolicyNumber IS NULL)
END