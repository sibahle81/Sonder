CREATE PROCEDURE [policy].[FuneralLivesReport]
       @StartDate As Date,
       @EndDate AS Date

AS
BEGIN

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
              [CreationDate] = CAST(papol.[CreatedDate] AS DATE),
              p.[InstallmentPremium] AS [CurrentPremium],
              ICD.[Name] AS [IndustryClass],
              [brokerage].[Name] AS [BrokerName],
              [parp].DisplayName AS [Schemename],
              [agent].FirstName + ' ' + [agent].SurnameOrCompanyName AS [AgentName],
              cps.[Name] AS [Status],
              p.[CancellationDate],
              p.[LastLapsedDate],
              ccr.[Name] AS [CancelReason],
              cpn.[DateOfDeath] AS [DeathDate],
              CAST(p.[CreatedDate] AS DATE) AS [ApplicatioDate],
              [brokerage].[Name] + [parp].DisplayName AS BrokerScheme,
              1 AS [PolicyCount],
              p.PolicyCancelReasonId,
              p.PolicyStatusId,
              prod.Name as [ProductOption]
       
       --select count(*)--64446
       INTO #TempCBR
       FROM [policy].[Policy] p 
       inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
       left join [policy].[Policy] papol (nolock) on papol.PolicyId = p.ParentPolicyId
       inner join [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
       inner join Client.FinPayee cfp ON papol.[PolicyOwnerId] = cfp.RolePlayerID 
       inner join [common].[Industry] IC ON IC.Id =cfp.IndustryId
       inner join [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId      
       inner join [broker].Brokerage [brokerage] ON [BROKERAGE].Id = p.BrokerageId
       inner join [common].[PolicyStatus] cps ON p.[PolicyStatusId] = cps.[Id]
       left join [Client].Person cpn ON  r.RolePlayerId = cpn.RolePlayerId
       left join [Client].Company ccmp ON r.RolePlayerId = ccmp.RolePlayerId
       left join [Common].PolicyCancelReason ccr ON p.[PolicyCancelReasonId] =ccr.[Id]
       inner join [broker].[Representative] [agent] ON p.RepresentativeId = [agent].Id
       LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = p.ProductOptionId
       LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
       where (papol.[CancellationDate] BETWEEN @StartDate AND @EndDate
                 OR papol.[LastLapsedDate] BETWEEN @StartDate AND @EndDate) 
          and p.IsDeleted = 0  

       SELECT 
              CASE WHEN [ControlName] LIKE '%Group%' THEN 'Group'
                                   WHEN [Schemename] IS NOT NULL THEN 'Group' 
                                  WHEN [ProductOption] LIKE '%Corporate - Staff%' THEN 'Individual'
                                  WHEN [ProductOption] LIKE '%Corporate(M+S%' THEN 'Individual'                                         
                   WHEN [ProductOption] LIKE '%Wage%' THEN 'Group'
                   WHEN [ProductOption] LIKE '%Corp%' THEN 'Group'
                   WHEN [ProductOption] LIKE '%Group%' THEN 'Group' 
                    WHEN [ProductOption] LIKE '%Grp%' THEN 'Group' 
                   WHEN [ProductOption] LIKE '%GABS Africa Funeral%' THEN 'Group'
                   WHEN [ProductOption] LIKE '%Family Funeral%' THEN 'Individual'                    
               ELSE 'Individual' END AS 'FuneralType', 
              [PolicyHolderName],
              [Name],
              [Surname],
              [IdNumber],
              [PassportNumber],
              [PolicyNumber],
              AdsolPolicyNumber,
              [CommenceDate] ,
              [CreationDate],
              [CurrentPremium],
              [IndustryClass],
              [BrokerName],
              [Schemename],
              [AgentName],
              [Status],
              Case when [Status] in ('Cancelled','Lapsed','Not Taken Up','Pending Reinstatement','Paused','Pending Continuation') then 'Cancelled' 
              when  [Status] in ('Pending First Premium','Reinstated','Continued','Pending Cancelled','Request Cancellation','Active') then 'Active' else [Status] end AS OverallStatus,
              [CancellationDate],
              [CancelReason],
              [DeathDate],
              [ApplicatioDate],
              [BrokerScheme],
              [PolicyCount],
              SUM(CASE WHEN PolicyStatusId = 13 THEN 1 ELSE 0 END) AS [Number Of Not Taken Up Policies],
              SUM(CASE WHEN PolicyStatusId = 5 THEN 1 ELSE 0 END) AS [Number Of Lapsed Policies],
              SUM(CASE WHEN PolicyStatusId = 7 THEN 1 ELSE 0 END) AS [Number Of Paused Policies],
                     SUM(CASE WHEN PolicyCancelReasonId = 10 THEN 1 ELSE 0 END) AS [Cancel Within Cooling Off Period],
                     SUM(CASE WHEN PolicyCancelReasonId in (1,12) THEN 1 ELSE 0 END) AS [Cancellation Request From Member],
                     SUM(CASE WHEN PolicyCancelReasonId = 7 THEN 1 ELSE 0 END) AS [Cancel by insurer],
                     SUM(CASE WHEN PolicyStatusId IN (13,5,7) OR PolicyCancelReasonId IN (10,1,12,7) THEN 1 ELSE 0 END) AS CANCELCOUNT,
              ISNULL(DATEDIFF(Month,([CommenceDate]),[CancellationDate]),0) AS [Number Of Months]

              FROM #TempCBR

              Group by 
              [ControlName],
              [ProductOption],
              [PolicyHolderName],
              [Name],
              [Surname],
              [IdNumber],
              [PassportNumber],
              [PolicyNumber],
              AdsolPolicyNumber,
              [CommenceDate] ,
              [CreationDate],
              [CurrentPremium],
              [IndustryClass],
              [BrokerName],
              [Schemename],
              [AgentName],
              [Status],
              [CancellationDate],
              [CancelReason],
              [DeathDate],
              [ApplicatioDate],
              [BrokerScheme],
              [PolicyCount],
              [PolicyStatusId],
              [PolicyCancelReasonId]

END