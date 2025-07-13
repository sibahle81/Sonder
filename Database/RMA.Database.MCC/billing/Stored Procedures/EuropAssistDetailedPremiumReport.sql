
---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/06/21
---- EXEC [billing].[EuropAssistDetailedPremiumReport] '2020-12-01', '2021-06-30',7
---- =============================================
CREATE   PROCEDURE [billing].[EuropAssistDetailedPremiumReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
	@ClientType Int


AS
BEGIN

DECLARE       
--				@StartDate As Date,
--               @EndDate AS Date,
--			   @ClientType Int,
			   @ClientTypechar char(2)
--SET         @StartDate = '2021-04-01'
--SET            @EndDate = '2021-06-30'
--set @ClientType =7
set @ClientTypechar = cast(@ClientType as char(2))
       
	   DECLARE @EuropAssistRMAPremium Decimal(18,2)
	   SET @EuropAssistRMAPremium = (SELECT [BasePremium] + [ProfitExpenseLoadingPremium] FROM [common].[EuropAssistPremiumMatrix] WHERE ([EndDate] > GetDate() OR [EndDate] IS NULL) AND IsDeleted = 0)

	   

       IF OBJECT_ID(N'tempdb..#tempparentpol', N'U') IS NOT NULL
              DROP TABLE #tempparentpol;

       select distinct
                       CASE WHEN ICD.Id = 4 THEN
                       (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
                       WHEN ICD.Id = 1 THEN 
                       (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1) 
                       WHEN ICD.Id = 2 THEN 
                       (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2) 
                       WHEN ICD.Id = 3 THEN 
                       (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4) 
                       END AS ControlName,
			  CASE WHEN ppo.Name LIKE '%Family%' 
				 THEN 'Individual'
				 WHEN ppo.Name LIKE '%Group%' 
				 THEN 'Group'
				 WHEN ppo.Name LIKE '%Corporate%'
				 THEN 'Corporate'
				 WHEN ppo.Name = 'RMA Staff'
				 THEN 'Staff'
				 WHEN ppo.Name LIKE '%Gold%'
				 THEN 'Gold Wage'
				 END AS					[Client Type],
              [PolicyHolderName] = r.[DisplayName],
              CASE WHEN r.RolePlayerIdentificationTypeId = 2 THEN ccmp.Name
                     WHEN r.RolePlayerIdentificationTypeId = 1 THEN cpn.FirstName + ' ' + cpn.Surname 
                      END AS [name],
              p.[PolicyNumber],
			  cpnc.FirstName AS [MainMemberName],
              cpnc.Surname AS [MainMemberSurname],
              paPol.[PolicyNumber] AS [ChildPolicyNumber],
              [Premium] = p.[InstallmentPremium] ,
              [IndustryClass] =ICD.[Name],
              [brokerage].[Name] AS [BrokerName],
              [parp].DisplayName AS [Schemename],
              cps.[Name] AS [Status],
			  p.IsEuropAssist,
			  [brokerage].[FSPNumber] AS [FSPNumber]
              

       into #tempparentpol                      
       FROM [policy].[Policy] p (NOLOCK)
       inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = p.[PolicyOwnerId]
       left join Client.FinPayee cfp (NOLOCK) ON p.[PolicyOwnerId] = cfp.RolePlayerID 
       left join [common].[Industry] IC (NOLOCK) ON IC.Id =cfp.IndustryId
       left join [common].[IndustryClass] ICD (NOLOCK) ON ICD.Id =IC.IndustryClassId
       left join [common].[PolicyStatus] cps (NOLOCK) ON p.[PolicyStatusId] = cps.[Id]
       left join Client.Person cpn (NOLOCK) ON  r.RolePlayerId = cpn.RolePlayerId
       left join Client.Company ccmp (NOLOCK) ON r.RolePlayerId = ccmp.RolePlayerId
       left join [policy].[Policy] paPol (nolock) on  p.PolicyId = paPol.ParentPolicyId 
       left join [client].[roleplayer] parp (NOLOCK) on parp.RolePlayerId = papol.policyOwnerId
       left join Client.Person cpnc (NOLOCK) ON  parp.RolePlayerId = cpnc.RolePlayerId
	   left join [broker].Brokerage [brokerage] (NOLOCK) ON [BROKERAGE].Id = p.BrokerageId
       inner join  Product.ProductOption ppo (NOLOCK) ON p.ProductOptionId = ppo.Id
	   left join [common].[ClientType] cct (NOLOCK) ON (CASE WHEN ppo.Name LIKE '%Family%' 
				 THEN 'Individual'
				 WHEN ppo.Name LIKE '%Group%' 
				 THEN 'Group'
				 WHEN ppo.Name LIKE '%Corporate%'
				 THEN 'Corporate'
				 WHEN ppo.Name = 'RMA Staff'
				 THEN 'Staff'
				 WHEN ppo.Name LIKE '%Gold%'
				 THEN 'GoldWage'
				 END)=cct.Name
       WHERE p.policyid IN (SELECT PolicyId FROM [policy].[policy]
                                                WHERE PolicyStatusId in (1,8))
       AND p.Isdeleted =0
	   AND cast(cct.Id as char(2)) in (  SELECT value from STRING_SPLIT( @ClientTypechar ,',') )
	   AND p.EuropAssistEffectiveDate BETWEEN @StartDate AND @EndDate
	   AND p.IsEuropAssist = 1  
	   --and p.policynumber='01-202008-008225'


       SELECT DISTINCT
              CASE WHEN tmp.[ControlName] LIKE '%Group%' THEN 'Group'
          WHEN ppr.Name LIKE '%Wage%' THEN 'Group'
                WHEN ppr.Name LIKE '%Corporate%' THEN 'Group'
          WHEN ppr.Name LIKE '%Family Funeral%' THEN 'Individual' 
          WHEN ppr.Name LIKE '%Group%' THEN 'Group' 
          ELSE 'Individual' END AS 'FuneralType', 
			  [parp].DisplayName AS [Schemename],			 
			  [BrokerName],
			  tmp.[Client Type],       
              tmp.[ChildPolicyNumber],
              tmp.[Premium],
              r.[DisplayName] AS [ChildPolicyHolderName],
              p.[InstallmentPremium] AS [ChildPremium],
			  CASE WHEN tmp.IsEuropAssist =1 THEN (CASE WHEN tmp.[FSPNumber] = '46113' THEN @EuropAssistRMAPremium ELSE (SELECT FORMAT([BasePremium]/(1-(0.2 + p.CommissionPercentage)),'N2') FROM [common].[EuropAssistPremiumMatrix]) END)
						ELSE '0' END AS Amount,
			  tmp.[MainMemberName],
              tmp.[MainMemberSurname],
               [Status],
			  cps.Name AS [Policy Status],
			  p.EuropAssistEffectiveDate

              
--select count(*)
       from policy.policy p (NOLOCK)
       inner join #tempparentpol tmp (NOLOCK) on p.[PolicyNumber] = tmp.[ChildPolicyNumber]
       inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = p.[PolicyOwnerId]
       left join Client.FinPayee cfp (NOLOCK) ON p.[PolicyOwnerId] = cfp.RolePlayerID 
       LEFT JOIN policy.PolicyInsuredLives pil (NOLOCK) ON p.PolicyId = pil.PolicyId
       inner join [client].[RolePlayer] rr (NOLOCK) on rr.[RolePlayerId] = pil.[RolePlayerId]
       left join Client.Person cpn (NOLOCK) ON  rr.RolePlayerId = cpn.RolePlayerId
       LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = p.ProductOptionId
       LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
       Left join [common].[PolicyStatus] cps (NOLOCK) ON p.[PolicyStatusId] = cps.[Id]
	   left join [policy].[Policy] papol (nolock) on papol.PolicyId = p.ParentPolicyId
	   left join [client].[roleplayer] parp (NOLOCK) on parp.RolePlayerId = papol.policyOwnerId

	   Where p.Isdeleted =0
	   AND p.Isdeleted =0
	   AND p.EuropAssistEffectiveDate BETWEEN @StartDate AND @EndDate
	   AND p.IsEuropAssist = 1
       ORDER BY tmp.[ChildPolicyNumber]

END