CREATE PROCEDURE [policy].[FuneralCancelConductofBusinessReturnReport]
       @StartDate As Date,
       @EndDate AS Date
AS
BEGIN
DECLARE @CurrentYearMonth INT

       SET @CurrentYearMonth =(YEAR(GETDATE()) * 100) + (MONTH(GETDATE()))

------Insured Lives----
      IF OBJECT_ID(N'tempdb..#TempPolicyInsuredLives', N'U') IS NOT NULL
                                                                                DROP TABLE #TempPolicyInsuredLives;

                select count(policyid) Nooflives,
                                                                                  policyid 
                into #TempPolicyInsuredLives
                from [policy].[PolicyInsuredLives]
                group by policyid


       IF OBJECT_ID(N'tempdb..#TempCBR', N'U') IS NOT NULL
              DROP TABLE #TempCBR;

       SELECT           
       CASE WHEN ICD.Id = 4 THEN
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
        WHEN ICD.Id = 1  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
              WHEN ICD.Id = 2  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
              WHEN ICD.Id = 3  THEN 
        (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
         END AS [ControlName], 
              [PolicyHolderName] = parp.[DisplayName],
              cpn.FirstName  AS [Name],
              cpn.Surname AS [Surname],
              cpn.[IdNumber],
              '' AS [PassportNumber],
              p.[PolicyNumber],
              p.[ClientReference] AS AdsolPolicyNumber,
              p.[PolicyInceptionDate] AS [CommenceDate] ,
              (YEAR(p.[PolicyInceptionDate]) * 100) + (MONTH(p.[PolicyInceptionDate])) AS [PolicyInceptionYearMonth],
              YEAR(p.[PolicyInceptionDate]) AS [PolicyInceptionYear],
              MONTH(p.[PolicyInceptionDate]) AS [PolicyInceptionMonth],
              [CreationDate] = CAST(papol.[CreatedDate] AS DATE),
              p.[InstallmentPremium] AS [CurrentPremium],
              ICD.[Name] AS [IndustryClass],
              [brokerage].[Name] AS [BrokerName],
              [parp].DisplayName AS [Schemename],
              [agent].FirstName + ' ' + [agent].SurnameOrCompanyName AS [AgentName],
              cps.[Name] AS [Status],
              cpss.[Name] AS [ChildStatus],
              Case when cps.[Name] in ('Cancelled','Lapsed','Not Taken Up','Pending Cancelled','Paused','Pending Continuation') then 'Cancelled' 
                   when  cps.[Name] in ('Pending First Premium','Reinstated','Continued') then 'Active' else cps.[Name] end AS OverallStatus,
              Case when cpss.[Name] in ('Cancelled','Lapsed','Not Taken Up','Pending Cancelled','Paused','Pending Continuation') then 'Cancelled' 
                   when  cpss.[Name] in ('Pending First Premium','Reinstated','Continued') then 'Active' else cpss.[Name] end AS ChildOverallStatus,
              ISNULL(papol.[CancellationDate],p.[CancellationDate]) AS [CancellationDate],
                                                  p.[CancellationDate] as ChildCancelationdate,
              --ISNULL(papol.[LastLapsedDate],p.[LastLapsedDate]) AS [LastLapsedDate],
                                                  p.[LastLapsedDate] AS [LastLapsedDate],
              ccr.[Name] AS [CancelReason],
              cpn.[DateOfDeath] AS [DeathDate],
              CAST(p.[CreatedDate] AS DATE) AS [ApplicatioDate],
              [brokerage].[Name] + [parp].DisplayName AS BrokerScheme,
                                                  CASE WHEN crt.Name LIKE 'Natural' AND [brokerage].[Name] LIKE '%RAND MUTUAL%' THEN 'RMA Written business'
                                                                   WHEN crt.Name LIKE 'Juristic' THEN 'Juristic rep written business'
                                                                   WHEN crt.Name LIKE 'Natural' AND [brokerage].[Name] NOT LIKE '%RAND MUTUAL%'  THEN 'Independent brokers written business'
                                                                   END AS Underwritter,
                                                  prod.Name as [ProductOption],
              SUM(CASE WHEN p.PolicyStatusId = 13 THEN 1 ELSE 0 END) AS [Number Of Not Taken Up Policies],
              SUM(CASE WHEN p.PolicyStatusId = 5 THEN 1 ELSE 0 END) AS [Number Of Lapsed Policies],
              SUM(CASE WHEN p.PolicyStatusId = 7 THEN 1 ELSE 0 END) AS [Number Of Paused Policies],
              SUM(CASE WHEN p.PolicyCancelReasonId = 10 THEN 1 ELSE 0 END) AS [Cancel Within Cooling Off Period],
              SUM(CASE WHEN p.PolicyCancelReasonId in (1,12) THEN 1 ELSE 0 END) AS [Cancellation Request From Member],
              SUM(CASE WHEN p.PolicyCancelReasonId = 7 THEN 1 ELSE 0 END) AS [Cancel by insurer],
              SUM(CASE WHEN p.PolicyStatusId IN (13,5,7) OR p.PolicyCancelReasonId IN (10,1,12,7) THEN 1 ELSE 0 END) AS CANCELCOUNT,
              ISNULL(DATEDIFF(Month,(p.[PolicyInceptionDate]),p.[CancellationDate]),0) AS [Number Of Months],
              Sum(tpil.Nooflives) AS [Lives]




       --select count(*)--64446
       INTO #TempCBR
       FROM [policy].[Policy] p 
       inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
       left join [policy].[Policy] papol (nolock) on papol.PolicyId = p.ParentPolicyId
      left join [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
       left join Client.FinPayee cfp ON papol.[PolicyOwnerId] = cfp.RolePlayerID 
       left join [common].[Industry] IC ON IC.Id =cfp.IndustryId
       left join [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId 
       left join [broker].Brokerage [brokerage] ON [BROKERAGE].Id = p.BrokerageId
       left join [common].[PolicyStatus] cps ON papol.[PolicyStatusId] = cps.[Id]
       left join [common].[PolicyStatus] cpss ON p.[PolicyStatusId] = cpss.[Id]
       left join [Client].Person cpn ON  r.RolePlayerId = cpn.RolePlayerId
       left join [Client].Company ccmp ON r.RolePlayerId = ccmp.RolePlayerId
       left join [Common].PolicyCancelReason ccr ON p.[PolicyCancelReasonId] =ccr.[Id]
       inner join [broker].[Representative] [agent] ON p.RepresentativeId = [agent].Id
       left join [common].[RepType] crt ON agent.RepTypeId = crt.[Id]
       LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = p.ProductOptionId
       LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
       left join #TempPolicyInsuredLives tpil on tpil.[PolicyId] = p.[PolicyId]

        WHERE p.IsDeleted = 0
        and (p.[CancellationDate] BETWEEN @StartDate AND @EndDate
                                OR p.[LastLapsedDate] BETWEEN @StartDate AND @EndDate)
        or p.[CancellationDate] is null


       GROUP BY
         ICD.Id ,
              parp.[DisplayName],
              cpn.FirstName,
              cpn.Surname,
              cpn.[IdNumber],
              p.[PolicyNumber],
              p.[ClientReference],
              p.[PolicyInceptionDate],
              CAST(papol.[CreatedDate] AS DATE),
              p.[InstallmentPremium],
              ICD.[Name],
              [brokerage].[Name],
              [parp].DisplayName,
              [agent].FirstName + ' ' + [agent].SurnameOrCompanyName,
              cps.[Name],cpss.[Name],
              papol.[CancellationDate],
              p.[CancellationDate],
              papol.[LastLapsedDate],
              p.[LastLapsedDate],
              ccr.[Name],
              cpn.[DateOfDeath],
              CAST(p.[CreatedDate] AS DATE),
              prod.[Name] ,
              CASE WHEN crt.Name LIKE 'Natural' AND [brokerage].[Name] LIKE '%RAND MUTUAL%' THEN 'RMA Written business'
                     WHEN crt.Name LIKE 'Juristic' THEN 'Juristic rep written business'
                     WHEN crt.Name LIKE 'Natural' AND [brokerage].[Name] NOT LIKE '%RAND MUTUAL%'  THEN 'Independent brokers written business'
                     END,
              papol.[PolicyInceptionDate]

       SELECT 
                                                  CASE WHEN [Schemename] IS NOT NULL THEN 'Group'
                   ELSE 'Individual' END AS 'FuneralType', 
                                                  CASE WHEN [ProductOption] LIKE '%Family%' THEN 'Individual'
                WHEN [ProductOption] LIKE '%Group%' THEN 'Group'
                WHEN [ProductOption] LIKE '%Corporate%' THEN 'Corporate'
                WHEN [ProductOption] = 'RMA Staff' THEN 'Staff'
                WHEN [ProductOption] LIKE '%Gold%' THEN 'GoldWage'
                END AS [ClientType],
              [PolicyHolderName],
              [Name],
              [Surname],
              [IdNumber],
              [PassportNumber],
              [PolicyNumber],
              AdsolPolicyNumber,
              [CommenceDate] ,
              [PolicyInceptionYearMonth],
              [PolicyInceptionYear],
              [PolicyInceptionMonth],
              CASE WHEN [PolicyInceptionMonth] BETWEEN 1 AND 3 THEN 'Q1' 
                   WHEN [PolicyInceptionMonth] BETWEEN 4 AND 6 THEN 'Q2'
                   WHEN [PolicyInceptionMonth] BETWEEN 7 AND 9 THEN 'Q3' 
                    ELSE 'Q4' END AS [Quaurter],
              [CreationDate],
              [CurrentPremium],
              [IndustryClass],
              [BrokerName],
              [Schemename],
              [AgentName],
              [Status],
              [ChildStatus],
              [OverallStatus],
              [ChildOverallStatus],
              [CancellationDate],
              [LastLapsedDate],
              [CancelReason],
              [DeathDate],
              [ApplicatioDate],
              BrokerScheme,
              Underwritter,
              [Number Of Not Taken Up Policies],
              [Number Of Lapsed Policies],
              [Number Of Paused Policies],
              [Cancel Within Cooling Off Period],
              [Cancellation Request From Member],
              [Cancel by insurer],
              CANCELCOUNT,
              [Number Of Months],
              [Lives]
              FROM #TempCBR
              Where (OverallStatus ='Cancelled' or ChildOverallStatus='Cancelled')
              AND ([CancellationDate] BETWEEN @StartDate AND @EndDate
                     OR [LastLapsedDate] BETWEEN @StartDate AND @EndDate) 


END