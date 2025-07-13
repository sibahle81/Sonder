CREATE PROCEDURE [policy].[PremiumReport]
	@ClientTypeId INT = NULL, 
	@Product INT = NULL, 
	@PeriodType INT = NULL, -- daily, weekly, monthly and yearly,
	@StartDate DATETIME, 
	@EndDate DATETIME,
	@PolicyStatus INT = NULL
AS

--DECLARE @ClientTypeId INT = NULL, 
--		@Product INT = NULL, 
--		@PeriodType INT = NULL, -- daily, weekly, monthly and yearly,
--		@StartDate DATETIME, 
--		@EndDate DATETIME,
--		@PolicyStatus INT = NULL

--	Set @ClientTypeId	= 3
--	Set @Product		= 0
--	Set @PeriodType		= 5
--	Set @StartDate		= '2021-04-01'
--	Set @EndDate		= '2021-08-02'
--	Set @PolicyStatus	= 0

BEGIN
	
	DECLARE @PeriodDate DATE = NULL;
	DECLARE @rolePlayerIdentificationTypeId INT = NULL; 

	IF(@PeriodType IS NOT NULL AND @PeriodType <> 5)
	BEGIN
		SELECT @PeriodDate =
			CASE WHEN @PeriodType = 1 THEN DATEADD(DAY, DATEDIFF(DAY, 0, GETDATE() -0), 0)
				 WHEN @PeriodType = 2 THEN DATEADD(WEEK, DATEDIFF(WEEK, -1, GETDATE()), -1)
				 WHEN @PeriodType = 3 THEN DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) 
				 WHEN @PeriodType = 4 THEN DATEADD(YEAR, DATEDIFF(YEAR, 0, GETDATE()), 0) 
		END
	END


	IF(@ClientTypeId IS NOT NULL)
	BEGIN
		SELECT @rolePlayerIdentificationTypeId =
			CASE WHEN @ClientTypeId = 1 THEN 1
				 WHEN @ClientTypeId = 0 THEN 2
				 WHEN @ClientTypeId = 3 THEN Null
		END
	END

	IF(@Product = 0)
		SET @Product = NULL

	IF(@PolicyStatus = 0)
		SET @PolicyStatus = NULL

	Select Distinct CC.RoleplayerId,
		CC.Name as 'MemberName', 
		CC.CreatedDate as 'MemberCreatedDate',
		CC.ReferenceNumber, 
		CC.CompensationFundReferenceNumber, 
		CC.IdNumber as 'MemberRegistration', 
		CC.VatRegistrationNo, 
		CFP.FinPayeNumber as 'MemberNumber', 
		CIC.Name as 'IndustryClass', 
		CI.Name as 'Industry',
		CRC.Firstname + ' ' + CRC.Surname as 'ContactPersonName',
		CRC.ContactNumber,
		CASE 
			WHEN CRP.RolePlayerIdentificationTypeId = 2 THEN 'Company'
			ELSE 'Individual' END AS ClientType,
		(SELECT CASE WHEN COUNT(*) > 0 THEN 'Active' ELSE 'Active - No policies' END from [policy].[policy] where PolicyOwnerId = CRP.RolePlayerId ) as MemberStatus,
		PPR.Name as Product,
		PP.PolicyOwnerId as 'PolicyOwnerId',
		PP.ProductOptionId,
		CPS.[Name] as 'PolicyStatus',
		PP.PolicyStatusId,
		PP.PolicyInceptionDate,
		YEAR(PP.PolicyInceptionDate) as 'UnderwritingYear',
		PP.AnnualPremium,
		PP.InstallmentPremium,
		'' as 'GroupName',
		CCI.Name as 'Category Insured',
		PB.Name as 'BenefitName',
		PB.Code as 'BenefitCode',
		QTD.NumberOfEmployees,
		QTD.Earnings,
		'' as 'LivesReceivingLIA',
		'' as 'LIAValue',
		QTD.Rate,
		QTD.Premium,
		'' as 'SubmissionStatus',
		(Select Top 1 CIS.Name from [billing].[Invoice] BIN INNER JOIN [Common].[InvoiceStatus] CIS ON BIN.InvoiceStatusID = CIS.ID where BIN.PolicyId = PP.PolicyId) as 'PaymentStatus',
		PP.CreatedDate,
		PP.PolicyInceptionDate as 'CoverInceptionDate',
		PP.ExpiryDate as 'CoverExpiryDate'
		From [Client].[RolePlayer] CRP
		LEFT JOIN [Client].[Company] CC ON CC.RolePlayerId = CRP.RolePlayerId
		LEFT JOIN [Client].[Person] [Person] ON [Person].RolePlayerId = CRP.RolePlayerId
		LEFT JOIN [Client].[RolePlayerAddress] [Address] ON [Address].RolePlayerId = CRP.RolePlayerId
		LEFT JOIN [Client].[RolePlayerContact] CRC ON CRC.RolePlayerId = CRP.RolePlayerId
		LEFT JOIN [Client].[RolePlayerBankingDetails] [Bank] ON [Bank].RolePlayerId = CRP.RolePlayerId
		LEFT JOIN [Client].[FinPayee] CFP ON CFP.RolePlayerId = CRP.RolePlayerId
		LEFT JOIN [policy].[Policy] PP ON PP.PolicyOwnerId = CRP.RolePlayerId
		LEFT JOIN [product].[ProductOption] PPO ON PPO.Id = PP.ProductOptionId
		LEFT JOIN [product].[Product] PPR ON PPR.Id = PPO.ProductId
		LEFT JOIN [common].[IndustryClass] CIC ON CIC.Id = cc.IndustryClassId
		LEFT JOIN [common].[Industry] CI ON CI.Id = CFP.IndustryId
		LEFT JOIN [common].[PolicyStatus] CPS ON PP.[PolicyStatusId] = CPS.[Id]
		LEFT JOIN [quote].[Quote] QT ON PP.QuoteId = QT.QuoteID
		LEFT JOIN [quote].[QuoteDetail] QTD ON QT.QuoteId = QTD.QuoteId
		LEFT JOIN [common].[CategoryInsured] CCI ON QTD.CategoryInsuredId = CCI.Id
		LEFT JOIN [product].[Benefit] PB ON PPO.ProductId = PB.ProductID
		WHERE (@rolePlayerIdentificationTypeId  IS NULL OR CRP.[RolePlayerIdentificationTypeId] = @rolePlayerIdentificationTypeId ) 
		AND (@StartDate Is Null or  (CC.[CreatedDate] >= @StartDate and CC.[CreatedDate] <= CONVERT(DATETIME, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111)))
		AND (@PeriodDate  IS NULL OR CC.CreatedDate >= @PeriodDate ) 
		AND (@Product  IS NULL OR PPR.Id = @Product ) 
		AND (@PolicyStatus  IS NULL OR PP.PolicyStatusId = @PolicyStatus ) 
		order by MemberName
		
END	
	