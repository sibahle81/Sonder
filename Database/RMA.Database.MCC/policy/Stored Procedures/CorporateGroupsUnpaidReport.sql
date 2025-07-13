
---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/02/03
---- EXEC [policy].[CorporateGroupsUnpaidReport] '2020-01-01', '2021-12-31'
---- =============================================
CREATE PROCEDURE [policy].[CorporateGroupsUnpaidReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL

AS
BEGIN

	--SET @StartDate = '2020-01-01'
	--SET @EndDate = '2020-12-31'


--Add Payments information to the schemes

SELECT 
	DISTINCT
		bb.Name AS [Broker Name], 
		parp.DisplayName AS [Schemename] ,
		pp.[PolicyInceptionDate] AS [Inception Date],
		su.[DisplayName] AS [Broker Consultant],
		cpf.[Name] AS [Premium Frequency],
		cpm.[Name] AS [Premium Payment Method],
		--pp.InstallmentPremium AS Premium
		pp.[InstallmentPremium] AS Premium,
		'' AS [POP date received],
		'' AS [Policy Schedule Date Received],
		MONTH(pp.CreatedDate) AS [CreatedMonth],
		YEAR(pp.CreatedDate) AS [CreatedYear],
		(YEAR(pp.CreatedDate) * 100) + (MONTH(pp.CreatedDate)) AS [CreatedYearMonth],
		'' AS [Sales Comment],
		CASE WHEN MONTH(pp.CreatedDate) = 1 THEN 'January'
			 WHEN MONTH(pp.CreatedDate) = 2 THEN 'February'
			 WHEN MONTH(pp.CreatedDate) = 3 THEN 'March'
			 WHEN MONTH(pp.CreatedDate) = 4 THEN 'April'
			 WHEN MONTH(pp.CreatedDate) = 5 THEN 'May'
			 WHEN MONTH(pp.CreatedDate) = 6 THEN 'June'
			 WHEN MONTH(pp.CreatedDate) = 7 THEN 'July'
			 WHEN MONTH(pp.CreatedDate) = 8 THEN 'August'
			 WHEN MONTH(pp.CreatedDate) = 9 THEN 'September'
			 WHEN MONTH(pp.CreatedDate) = 10 THEN 'October'
			 WHEN MONTH(pp.CreatedDate) = 11 THEN 'November'
			 WHEN MONTH(pp.CreatedDate) = 12 THEN 'December'
			 ELSE 'No data'
		END AS [MONTH] --select count(*)
FROM 
		[Policy].[Policy] pp 
		INNER JOIN [client].[RolePlayer] r on r.[RolePlayerId] = pp.[PolicyOwnerId]
		INNER JOIN [Broker].[Brokerage] bb ON pp.[BrokerageId] = bb.[Id]
		INNER JOIN Common.PaymentMethod cpm ON pp.PaymentMethodId = cpm.Id
		INNER JOIN Common.PaymentFrequency cpf ON pp.PaymentFrequencyId = cpf.Id
		--LEFT JOIN Billing.Invoice bi ON pp.PolicyId = bi.PolicyId 		
		INNER JOIN [policy].[Policy] paPol (nolock) on paPol.PolicyId = pp.ParentPolicyId
		INNER JOIN [client].[roleplayer] paRp on paRp.RolePlayerId = paPol.policyOwnerId
		INNER JOIN broker.BrokerageBrokerConsultant (NOLOCK) bbc ON bb.[Id] = bbc.[BrokerageId]
		INNER JOIN [security].[User] su ON bbc.UserId = su.Id
		WHERE pp.CreatedDate BETWEEN @StartDate AND @EndDate
		AND paRp.[RolePlayerIdentificationTypeId] = 2
 
END