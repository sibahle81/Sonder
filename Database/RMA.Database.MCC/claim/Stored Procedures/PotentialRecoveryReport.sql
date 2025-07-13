CREATE PROCEDURE [Claim].[PotentialRecoveryReport]
	@StartDate DATETIME, 
	@EndDate DATETIME
AS

--DECLARE	@StartDate DATETIME, 
--		@EndDate DATETIME

--Set @StartDate		= '2024-01-01'
--Set @EndDate		= '2024-02-06'

BEGIN

--IF(OBJECT_ID('tempdb..##temp_RecoveryReport') IS NOT NULL) BEGIN DROP TABLE ##temp_RecoveryReport END
CREATE TABLE #temp_RecoveryReport(
    Industry varchar(20),
	RMABranchName varchar(50),
	FinPayeeNumber varchar(50),
	PolicyHolderName varchar(50),
	ClaimRefNumber varchar(50),
	ReceivedYear DateTime,
	ReceivedYear1 int,
	PaidAmount Decimal(18,2),
	FirstName varchar(50),
	Surname varchar(50),
	LiabilityAcceptedDate datetime,
	LiabilityAcceptedBy varchar(50),
	EventCreatedDate datetime,
	EventCreatedDateId int,
	EstimatedValue int,
	AllocatedValue int,
	OutstandingValue int,
	IsReferredToLegal varchar(10))

IF(@StartDate IS NULL)
	BEGIN
		Set @StartDate = DATEADD(yy, DATEDIFF(yy, 0, GETDATE()), 0)
		Set @EndDate = GETDATE()
	END

Insert INTO #temp_RecoveryReport
select
CIC.[Name] As IndustryClass,
'' As RMABranchName,
CF.FinPAyeNumber As FinPayeeNumber,
CC.[Name] As PolicyHolderName,
C.ClaimReferenceNumber As ClaimRefNumber,
C.CreatedDate As ReceivedYear,
YEAR(C.CreatedDate) As ReceivedYear1,
CIA.AssessedAmount As PaidAmount,
CP.FirstName As FirstName,
CP.Surname As Surname,
CASE When C.ClaimLiabilityStatusId in (1,3,7,8) THEN C.ModifiedDate Else null End As LiabilityAcceptanceDate,
CASE When C.ClaimLiabilityStatusId in (1,3,7,8) THEN SU.DisplayName Else null End As LiabilityAcceptedBy,
PE.CreatedDate As EventCreatedDate,
0 As EventCreatedDateId,
0 As EstimatedValue,
0 As AllocatedValue,
0 As OutstandingValue,
'No' As IsReferredToLegal
from Claim.Claim C
INNER JOIN Claim.PersonEvent PE ON C.PErsonEventId = PE.PErsonEventId
LEFT JOIN [Client].[FinPayee] CF ON CF.RolePlayerId = PE.ClaimantId
LEFT JOIN [client].[company] CC ON CC.RolePlayerId = CF.RolePlayerId
LEFT JOIN [common].[Industry] CI ON CI.Id = CC.IndustryId
LEFT JOIN [common].[IndustryClass] CIC ON CIC.Id = CC.IndustryClassId
INNER JOIN [Claim].[ClaimInvoice] CCI ON CCI.ClaimId = C.ClaimId
INNER JOIN [Claim].[InvoiceAllocation] CIA ON CIA.ClaimInvoiceId = CCI.ClaimInvoiceId
LEFT JOIN [client].[RolePlayer] RP ON RP.RolePlayerId = PE.InsuredLifeId
LEFT JOIN [client].[Person] CP ON CP.RoleplayerId = PE.InsuredLifeId
LEFT JOIN [security].[user] SU ON SU.Email = C.ModifiedBy
where (@StartDate Is Null or  (C.[CreatedDate] >= @StartDate and C.[CreatedDate] <= CONVERT(DATETIME, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111)))


SELECT DISTINCT * FROM #temp_RecoveryReport;
drop table #temp_RecoveryReport

--Select * from #temp_RecoveryReport

END