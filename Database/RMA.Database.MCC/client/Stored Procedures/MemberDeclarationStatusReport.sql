CREATE PROCEDURE [client].[MemberDeclarationStatusReport]
	@StartDate DATETIME, 
	@EndDate DATETIME,
	@DeclarationStatus INT = NULL
AS

--DECLARE	@StartDate DATETIME, 
--		@EndDate DATETIME,
--		@DeclarationStatus INT = NULL

--Set @StartDate		= '2021-01-01'
--Set @EndDate		= '2022-08-29'
--Set @DeclarationStatus	= 2

BEGIN

IF(OBJECT_ID('tempdb..##temp_memberComplianceReport') IS NOT NULL) BEGIN DROP TABLE ##temp_memberComplianceReport END

IF(@StartDate IS NULL)
	BEGIN
		--print 'test'
		Set @StartDate = DATEADD(yy, DATEDIFF(yy, 0, GETDATE()), 0)
		Set @EndDate = GETDATE()
	END

select Distinct [Bugeted].DeclarationId,[Bugeted].RolePlayerId,[Bugeted].FinPayeNumber,[Bugeted].CompanyName,[Bugeted].IndustryId,[Bugeted].Industry, [Bugeted].DeclarationYear,[Bugeted].CalculatedRate, 
[Bugeted].ProductOptionId,  [Bugeted].AverageEarnings AS ExpectedEarnings, [Bugeted].AverageEmployeeCount AS ExpectedNoOfLives,0 As TargetedAPI,[Bugeted].DeclaredFlag,[Bugeted].DeclarationChannel,
case when [Actual].AverageEarnings IS NULL then [Bugeted].AverageEarnings
	else [Actual].AverageEarnings End As [DeclaredEarnings],
[Bugeted].PremiumRaised,
case when [Actual].AverageEmployeeCount IS NULL then [Bugeted].AverageEmployeeCount
	else [Actual].AverageEmployeeCount End As [DeclaredLives],
[Bugeted].CreatedDate,[Bugeted].IndustryClassId,[Bugeted].IndustryClass,[Bugeted].ProductName
INTO ##temp_memberComplianceReport
from
(
select
DeclarationId,DeclarationStatusId,DeclarationTypeId,DeclarationRenewalStatusId,CD.RolePlayerId,CF.FinPAyeNumber,CC.[Name] As CompanyName,DeclarationYear,ProductOptionId,AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,
Premium,PenaltyRate,PenaltyPremium,Adjustment,Comment,
CC.[IndustryId],
CI.[Name] As Industry,
case when CD.PenaltyRate IS NULL then CD.Rate
	else CD.PenaltyRate End As CalculatedRate,
case when CD.DeclarationRenewalStatusId = 1 Then 'Not Declared'
	when CD.DeclarationRenewalStatusId = 2 Then 'Declared'
	when CD.DeclarationRenewalStatusId = 3 Then 'Not Declared' End As DeclaredFlag,
case when CD.DeclarationRenewalStatusId = 2 Then 'Manual'
	else '' End As DeclarationChannel,
case when CD.PenaltyPremium IS NULL then CD.Premium
	else CD.PenaltyPremium End As PremiumRaised,
CD.CreatedDate,
CC.IndustryClassId,
CIC.[Name] As IndustryClass,
PP.[Name] As ProductName
from client.Declaration CD
LEFT JOIN [Client].[FinPayee] CF ON CF.RolePlayerId = CD.RolePlayerId
LEFT JOIN [client].[company] CC ON CC.RolePlayerId = CD.RolePlayerId
LEFT JOIN [common].[Industry] CI ON CI.Id = CC.IndustryId
LEFT JOIN [common].[IndustryClass] CIC ON CIC.Id = CC.IndustryClassId
LEFT JOIN [product].[ProductOption] PPO ON PPO.Id = CD.ProductOptionId
LEFT JOIN [Product].[Product] PP ON PPO.ProductId = PP.Id
where DeclarationTypeId = 1 AND (@StartDate Is Null or  (CD.[CreatedDate] >= @StartDate and CD.[CreatedDate] <= CONVERT(DATETIME, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111)))
--and DeclarationYear = 2021 --and ProductOptionId = 122
) AS [Bugeted]
left join
(
select
DeclarationId,DeclarationStatusId,DeclarationTypeId,DeclarationRenewalStatusId,CD.RolePlayerId,CF.FinPAyeNumber,CC.[Name] As CompanyName,DeclarationYear,ProductOptionId,AverageEmployeeCount,AverageEarnings,PenaltyPercentage,Rate,
Premium,PenaltyRate,PenaltyPremium,Adjustment,Comment,
CC.[IndustryId],
CI.[Name] As Industry,
case when CD.PenaltyRate IS NULL then CD.Rate
	else CD.PenaltyRate End As CalculatedRate,
case when CD.DeclarationRenewalStatusId = 1 Then 'Not Declared'
	when CD.DeclarationRenewalStatusId = 2 Then 'Declared'
	when CD.DeclarationRenewalStatusId = 3 Then 'Not Declared' End As DeclaredFlag,
case when CD.DeclarationRenewalStatusId = 2 Then 'Manual'
	else '' End As DeclarationChannel,
case when CD.PenaltyPremium IS NULL then CD.Premium
	else CD.PenaltyPremium End As PremiumRaised,
CD.CreatedDate,
CC.IndustryClassId,
CIC.[Name] As IndustryClass,
PP.[Name] As ProductName
from client.Declaration CD
LEFT JOIN [Client].[FinPayee] CF ON CF.RolePlayerId = CD.RolePlayerId
LEFT JOIN [client].[company] CC ON CC.RolePlayerId = CD.RolePlayerId
LEFT JOIN [common].[Industry] CI ON CI.Id = CC.IndustryId
LEFT JOIN [common].[IndustryClass] CIC ON CIC.Id = CC.IndustryClassId
LEFT JOIN [product].[ProductOption] PPO ON PPO.Id = CD.ProductOptionId
LEFT JOIN [Product].[Product] PP ON PPO.ProductId = PP.Id
where DeclarationTypeId = 2 AND (@StartDate Is Null or  (CD.[CreatedDate] >= @StartDate and CD.[CreatedDate] <= CONVERT(DATETIME, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111)))
--and DeclarationYear = 2021 --and ProductOptionId = 122
) AS [Actual]
ON
[Actual].DeclarationYear = [Bugeted].DeclarationYear And
[Actual].ProductOptionId = [Bugeted].ProductOptionId And
[Actual].RolePlayerId = [Bugeted].RolePlayerId

IF(@DeclarationStatus = 0)
BEGIN
	--All
	SELECT DISTINCT * FROM ##temp_memberComplianceReport;
END
ELSE IF (@DeclarationStatus = 1)
BEGIN
	--Declared
	SELECT DISTINCT * FROM ##temp_memberComplianceReport WHERE DeclaredFlag = 'Declared'
END 
ELSE IF (@DeclarationStatus = 2)
BEGIN 
	--Not Declared
	SELECT DISTINCT * FROM ##temp_memberComplianceReport WHERE DeclaredFlag = 'Not Declared'
END

--Select * from ##temp_memberComplianceReport

END