CREATE PROCEDURE [lead].[MemberStatusReport]
	@ClientTypeId INT = NULL, 
	@Product INT = NULL, 
	@PeriodType INT = NULL, -- daily, weekly, monthly and yearly,
	@StartDate DATETIME, 
	@EndDate DATETIME,
	@MemberStatus INT = NULL
AS

--DECLARE @ClientTypeId INT = NULL, 
--		@Product INT = NULL, 
--		@PeriodType INT = NULL, -- daily, weekly, monthly and yearly,
--		@StartDate DATETIME, 
--		@EndDate DATETIME,
--		@MemberStatus INT = NULL

--	Set @ClientTypeId	= 3
--	Set @Product		= 0
--	Set @PeriodType		= 5
--	Set @StartDate		= '2021-01-01'
--	Set @EndDate		= '2021-06-07'
--	Set @MemberStatus	= 0

BEGIN

	IF(OBJECT_ID('tempdb..##temp_memberStatus') IS NOT NULL) BEGIN DROP TABLE ##temp_memberStatus END
	
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

	--IF(@MemberStatus = 0)
	--	SET @MemberStatus = NULL

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
		CASE 
			WHEN CRP.RolePlayerIdentificationTypeId = 2 THEN 'Company'
			ELSE 'Individual' END AS ClientType,
		(SELECT CASE WHEN COUNT(*) > 0 THEN 'Active' ELSE 'Active - No policies' END from [policy].[policy] where PolicyOwnerId = CRP.RolePlayerId ) as MemberStatus,
		PPR.Name as Product,
		PP.PolicyOwnerId as 'PolicyOwnerId',
		PP.ProductOptionId
		INTO ##temp_memberStatus
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
		LEFT JOIN common.IndustryClass CIC ON CIC.Id = cc.IndustryClassId
		LEFT JOIN common.Industry CI ON CI.Id = CFP.IndustryId
		WHERE (@rolePlayerIdentificationTypeId  IS NULL OR CRP.[RolePlayerIdentificationTypeId] = @rolePlayerIdentificationTypeId ) 
		AND (@StartDate Is Null or  (CC.[CreatedDate] >= @StartDate and CC.[CreatedDate] <= CONVERT(DATETIME, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111)))
		AND (@PeriodDate  IS NULL OR CC.CreatedDate >= @PeriodDate ) 
		AND (@Product  IS NULL OR PPR.Id = @Product ) 

		IF(@MemberStatus = 0)
		BEGIN
			SELECT DISTINCT * FROM ##temp_memberStatus;
		END
		ELSE IF (@MemberStatus = 1)
		BEGIN
		--Active
		SELECT DISTINCT * FROM ##temp_memberStatus WHERE MemberStatus = 'Active'
		END 
		ELSE IF (@MemberStatus = 2)
		BEGIN 
		--Active No Policies
		SELECT DISTINCT * FROM ##temp_memberStatus WHERE MemberStatus = 'Active - No Policies'
		END

		--SELECT DISTINCT * FROM ##temp_memberStatus;
END