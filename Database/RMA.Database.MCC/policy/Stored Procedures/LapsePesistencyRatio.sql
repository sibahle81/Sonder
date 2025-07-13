
CREATE PROCEDURE [policy].[LapsePesistencyRatio]
    @StartDate AS DATE,
    @EndDate AS DATE,
    @Brokerage AS VARCHAR(255)
AS
BEGIN

IF @Brokerage = 'All'
    BEGIN
    SELECT @Brokerage = NULL;
    END


SELECT 
        papol.[PolicyNumber] as [PolicyNumber], papol.[PolicyId],
              (FORMAT (papol.PolicyInceptionDate, 'MMM yyyy')) AS [InceptionDate],
              --[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName AS [Agent Name],
              [parp].DisplayName AS [Schemename],
              --[AGENT].Code AS [Code],
              cps.[Name] AS [Status],
              [BROKERAGE].Name AS [Intemediary Name],
              [BROKERAGE].Code AS [Intemediary Code],
              papol.[InstallmentPremium] [ParentPremium],
              papol.[InstallmentPremium] * 12 [ParentAnnualPremium],
              sum([policy].[InstallmentPremium]) -papol.[InstallmentPremium] [Premium],
              (sum([policy].[InstallmentPremium]) -papol.[InstallmentPremium]) * 12 [AnnualPremium],
              SUM(CASE WHEN [BROKERAGE].Id = [POLICY].BrokerageId  THEN 1 ELSE 0 END) AS [Total Number Of Policies],
              SUM(CASE WHEN [POLICY].PolicyStatusId = 1 AND [BROKERAGE].Id = [POLICY].BrokerageId THEN 1 ELSE 0 END) AS [Number Of Active Policies],
              --SUM(CASE WHEN papol.RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END) -SUM(CASE WHEN [POLICY].PolicyStatusId = 1 THEN 1 ELSE 0 END) AS [Number Of Lapsed Policies],
              SUM(CASE WHEN policy.PolicyStatusId IN (2,13,5,7,10) AND [BROKERAGE].Id = [POLICY].BrokerageId THEN 1 ELSE 0 END) AS [Number Of Lapsed Policies],      
              SUM(CASE WHEN [POLICY].PolicyStatusId = 15 AND [BROKERAGE].Id = [POLICY].BrokerageId THEN 1 ELSE 0 END) AS [Number Of Reinstated Policies],
              (CONVERT(DECIMAL(10,2),((CONVERT(DECIMAL(10,2),(SUM(CASE WHEN papol.RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END)))-(SUM(CASE WHEN [POLICY].PolicyStatusId = 1 THEN 1 ELSE 0 END)))/NULLIF((SUM(CASE WHEN papol.RepresentativeId = [AGENT].Id THEN 1 ELSE 0 END)),0))))*100 AS [Lapse Ratio %]

FROM 
       policy.[Policy] [POLICY] 
       INNER JOIN client.[RolePlayer] [ROLEPLAYER] ON [ROLEPLAYER].RolePlayerId = [POLICY].PolicyOwnerId
       INNER JOIN [broker].Brokerage [BROKERAGE] ON [BROKERAGE].Id = [POLICY].BrokerageId
       INNER JOIN [policy].[Policy] papol (nolock) on papol.PolicyId = [POLICY].ParentPolicyId
	   INNER JOIN [broker].[Representative] [AGENT] (nolock) ON [POLICY].RepresentativeId = [AGENT].Id
       INNER JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
       INNER JOIN [common].[PolicyStatus] cps ON papol.[PolicyStatusId] = cps.[Id]
       WHERE (papol.[CancellationDate] BETWEEN @StartDate AND @EndDate
              OR papol. [LastLapsedDate] BETWEEN @StartDate AND @EndDate
              OR [POLICY].[CancellationDate] BETWEEN @StartDate AND @EndDate
              OR [POLICY].[LastLapsedDate] BETWEEN @StartDate AND @EndDate
              OR [POLICY].[CancellationDate] IS NULL)
              AND ([brokerage].[Name] = @Brokerage OR  @Brokerage IS NULL)
              AND (papol.PolicyInceptionDate <= @EndDate)
			  

GROUP BY papol.[PolicyId],
        --[AGENT].FirstName + ' ' + [AGENT].SurnameOrCompanyName,
        --      [AGENT].Code,
              papol.[PolicyNumber],
              papol.[InstallmentPremium],
              [BROKERAGE].Name,
              [BROKERAGE].Code,
              [parp].DisplayName,
              FORMAT (papol.PolicyInceptionDate, 'MMM yyyy'),
              cps.[Name]
		order by [Schemename]



END