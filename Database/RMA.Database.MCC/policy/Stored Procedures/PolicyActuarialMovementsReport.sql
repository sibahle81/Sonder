
--exec [policy].[PolicyActuarialMovementsReport] '2020-08-04','2022-11-05',null,'All','All',null,0,0
CREATE PROCEDURE [policy].[PolicyActuarialMovementsReport]

	@StartDate AS DATE,
	@EndDate AS DATE,
	@PolicyNumber AS VARCHAR(50),
	@Brokerage AS VARCHAR(255),
    @Group AS Varchar (255),
    @JuristicRep AS vARCHAR(255),
    @DateType int,
	@ProductId int	

AS
BEGIN 
DECLARE 
		--@StartDate AS DATE,
		--@EndDate AS DATE,
		--@DateType int,
		--@PolicyNumber AS VARCHAR(50),
	    @StartMonth INT,
		@MinMonth INT
		--@Brokerage AS VARCHAR(255),
  --      @Group AS Varchar (255)	,
		--@JuristicRep AS VARCHAR(255),
		--@ProductId int

		--set @StartDate ='2020-01-1';
	 --   set @EndDate ='2022-08-23';
		--set @Brokerage ='All';
		--set @Group ='All';
		--set @DateType =0;
		SET @MinMonth =Year(Dateadd(MONTH,-1,@StartDate)) * 100 +(Month(Dateadd(MONTH,-1,@StartDate)));
		--SET @JuristicRep = NULL;
		--SET @ProductId =0

		IF @Brokerage = 'All'
                 BEGIN SELECT @Brokerage = NULL; END

		IF @Group = 'All'
                 BEGIN SELECT @Group = NULL; END

		IF @ProductId = 0
				 BEGIN SELECT @ProductId = NULL; END

declare @ParentPolicies Table (Id int identity(1,1),ParentPolicyId int not null)
insert @ParentPolicies
select distinct parentpolicyid 
from [policy].Policy 
where ParentPolicyId is not null 

IF OBJECT_ID(N'tempdb..#TempAuditLog', N'U') IS NOT NULL
			DROP TABLE #TempAuditLog;

		SELECT DISTINCT
			[ID] AS [AuditID],
			[ItemID],
			[Username] AS [User],
			[Action] AS [Action],
			JSON_VALUE(NewItem,'$.PolicyStatusId') as NewPolicyStatus,
			JSON_VALUE(OldItem,'$.PolicyStatusId') as OldPolicyStatus,
			JSON_VALUE(NewItem,'$.InstallmentPremium') as NewInstallmentPremium,
			JSON_VALUE(OldItem,'$.InstallmentPremium') as OldInstallmentPremium,
			JSON_VALUE(NewItem,'$.ModifiedBy') as NewModifiedBy,
			JSON_VALUE(OldItem,'$.ModifiedBy') as OldModifiedBy,
			JSON_VALUE(NewItem,'$.ModifiedDate') as NewModifiedDate,
			JSON_VALUE(OldItem,'$.ModifiedDate') as OldModifiedDate,
			Replace(Replace(Replace(Replace(Replace([NewItem],'"',''),'{',''),'','}'),'[]',''),'}','') AS [NewItem],
			Replace(Replace(Replace(Replace(Replace([OldItem],'"',''),'{',''),'','}'),'[]',''),'}','') AS [OldItem],
			[Date] AS [Date]


		INTO #TempAuditLog 
		FROM [audit].[AuditLog] 
		WHERE ([ItemType] = 'Policy_Policy')
		AND ([Date] BETWEEN @StartDate AND @EndDate)
		AND ISJSON(OldItem) =1
		AND (CAST(JSON_VALUE(OldItem,'$.InstallmentPremium') AS MONEY) <> CAST(JSON_VALUE(NewItem,'$.InstallmentPremium') AS MONEY)
		     OR CAST(JSON_VALUE(OldItem,'$.PolicyStatusId') AS INT) <> CAST(JSON_VALUE(NewItem,'$.PolicyStatusId') AS INT)
			)


--New Records

IF OBJECT_ID(N'tempdb..#TempAudit', N'U') IS NOT NULL
		DROP TABLE #TempAudit;

		SELECT  
			[AuditID],ItemId,[Action],[User],[Date],Benefits,Brokerage,JuristicRepresentative,PolicyBrokers,PolicyInsuredLives,PolicyInvoices,PolicyMovement,PolicyNotes,
			PolicyPayee,PolicyOwner,ProductOption,Representative,PolicyId,BrokerageId,ProductOptionId,RepresentativeId,JuristicRepresentativeId,PolicyOwnerId,
			PolicyPayeeId,PaymentFrequency,PaymentMethod,PolicyNumber,PolicyInceptionDate,ExpiryDate,CancellationDate,FirstInstallmentDate,LastInstallmentDate,
			RegularInstallmentDayOfMonth,DecemberInstallmentDayOfMonth,PolicyStatus,AnnualPremium,InstallmentPremium,CommissionPercentage,IsDeleted,CreatedBy,
			CreatedDate,ModifiedBy,ModifiedDate,AdminPercentage,PolicyCancelReason,ClientReference,LastLapsedDate,LapsedCount,LastReinstateDate,PolicyMovementId,
			PolicyPauseDate,CanLapse 
			INTO #TempAudit
		FROM ( 
		 SELECT [AuditID],ItemId,[Action],[User],[Date],
		  substring(Split.value,charindex(':',Split.value)-50,50) as [value1],
		  substring(Split.value,charindex(':',Split.value)+1,50) as [value]
		 FROM #TempAuditLog AS tmpAudit 
		 CROSS APPLY String_split([NewItem],',') AS Split) 
		 AS tbl
		Pivot (Max(Value) FOR [value1] IN (Benefits,Brokerage,JuristicRepresentative,PolicyBrokers,PolicyInsuredLives,PolicyInvoices,PolicyMovement,PolicyNotes,
			PolicyPayee,PolicyOwner,ProductOption,Representative,PolicyId,BrokerageId,ProductOptionId,RepresentativeId,JuristicRepresentativeId,PolicyOwnerId,
			PolicyPayeeId,PaymentFrequency,PaymentMethod,PolicyNumber,PolicyInceptionDate,ExpiryDate,CancellationDate,FirstInstallmentDate,LastInstallmentDate,
			RegularInstallmentDayOfMonth,DecemberInstallmentDayOfMonth,PolicyStatus,AnnualPremium,InstallmentPremium,CommissionPercentage,IsDeleted,CreatedBy,
			CreatedDate,ModifiedBy,ModifiedDate,AdminPercentage,PolicyCancelReason,ClientReference,LastLapsedDate,LapsedCount,LastReinstateDate,PolicyMovementId,
			PolicyPauseDate,CanLapse)
		) AS Pvt
		--where [ItemID]=188168


----Old Records

	IF OBJECT_ID(N'tempdb..#TempAuditOld', N'U') IS NOT NULL
		DROP TABLE #TempAuditOld;

		SELECT  
			[AuditID],ItemId,[Action],[User],[Date],Benefits,Brokerage,JuristicRepresentative,PolicyBrokers,PolicyInsuredLives,PolicyInvoices,PolicyMovement,PolicyNotes,
			PolicyPayee,PolicyOwner,ProductOption,Representative,PolicyId,BrokerageId,ProductOptionId,RepresentativeId,JuristicRepresentativeId,PolicyOwnerId,
			PolicyPayeeId,PaymentFrequency,PaymentMethod,PolicyNumber,PolicyInceptionDate,ExpiryDate,CancellationDate,FirstInstallmentDate,LastInstallmentDate,
			RegularInstallmentDayOfMonth,DecemberInstallmentDayOfMonth,PolicyStatus,AnnualPremium,InstallmentPremium,CommissionPercentage,IsDeleted,CreatedBy,
			CreatedDate,ModifiedBy,ModifiedDate,AdminPercentage,PolicyCancelReason,ClientReference,LastLapsedDate,LapsedCount,LastReinstateDate,PolicyMovementId,
			PolicyPauseDate,CanLapse 
			INTO #TempAuditOld
		FROM ( 
		 SELECT [AuditID],ItemId,[Action],[User],[Date],
		  substring(Split.value,charindex(':',Split.value)-50,50) as [value1],
		  substring(Split.value,charindex(':',Split.value)+1,50) as [value]
		 FROM #TempAuditLog AS tmpAudit 
		 CROSS APPLY String_split([OldItem],',') AS Split) 
		 AS tbl
		Pivot (Max(Value) FOR [value1] IN (Benefits,Brokerage,JuristicRepresentative,PolicyBrokers,PolicyInsuredLives,PolicyInvoices,PolicyMovement,PolicyNotes,
			PolicyPayee,PolicyOwner,ProductOption,Representative,PolicyId,BrokerageId,ProductOptionId,RepresentativeId,JuristicRepresentativeId,PolicyOwnerId,
			PolicyPayeeId,PaymentFrequency,PaymentMethod,PolicyNumber,PolicyInceptionDate,ExpiryDate,CancellationDate,FirstInstallmentDate,LastInstallmentDate,
			RegularInstallmentDayOfMonth,DecemberInstallmentDayOfMonth,PolicyStatus,AnnualPremium,InstallmentPremium,CommissionPercentage,IsDeleted,CreatedBy,
			CreatedDate,ModifiedBy,ModifiedDate,AdminPercentage,PolicyCancelReason,ClientReference,LastLapsedDate,LapsedCount,LastReinstateDate,PolicyMovementId,
			PolicyPauseDate,CanLapse)
		) AS Pvt



	IF OBJECT_ID(N'tempdb..#temp', N'U') IS NOT NULL
		DROP TABLE #temp;

		SELECT 
			[Date] ChangeDate,PolicyNumber,Policyid,PolicyStatus,modifiedDate,createddate,Brokerageid,CancellationDate,
			AnnualPremium,InstallmentPremium,PolicyCancelReason,LastLapsedDate,PolicyPauseDate,PolicyInceptionDate
		INTO #temp 
		FROM #TempAudit
		WHERE (PolicyNumber = @PolicyNumber  or @PolicyNumber IS NULL)

		UNION 

		SELECT 
			[Date] AS ChangeDate,PolicyNumber,Policyid,PolicyStatus,modifiedDate,createddate,Brokerageid,CancellationDate,
			AnnualPremium,InstallmentPremium,PolicyCancelReason,LastLapsedDate,PolicyPauseDate,PolicyInceptionDate
		FROM #TempAuditOld
		WHERE (PolicyNumber = @PolicyNumber  or @PolicyNumber IS NULL)
		ORDER BY 4

	
	  IF OBJECT_ID(N'tempdb..#Finale', N'U') IS NOT NULL
		DROP TABLE #Finale;

		CREATE TABLE #Finale (Policyid int,
							  [ModifiedDate] Varchar(50),
							  [RoleplayerID] int,
							  [Schemename] varchar(255),
							  [BrokerName] varchar(255),
							  [AgentName] varchar(255),
							  [JuristicRep] varchar(255),
							  [ParentPolicyNumber] varchar(50),
							  [ChildPolicyNumber] varchar(50),
							  [AdsolPolicyNumber] varchar(50),
							  [InstallmentPremium] decimal(18,2),
							  [PolicyInceptionDate] date,
							  [GroupInstallmentPremiums] decimal(18,2),
							  [MemberType] varchar(50),
							  [LifeCommencementDate] DATE,
							  [DateofBirth] date,
							  [IdNumber] varchar(50),
							  [AgeAtInception] int,
							  [PolicyStatusId] int,
							  [PolicyStatus] varchar(50),
							  [MovementCode] varchar(50),	
							  [ParentPolicyStatus] varchar(50),
							  [MemberStatus] varchar(20),
							  [Product] varchar(50),
							  [ProductOptionName] varchar(100),
							  [CoverAmount] decimal(18,2),
							  [PaidAmount] decimal(18,2),
							  [CauseOfDeath] varchar(255),
							  [DeathDate] date,
							  [ProductCategory] varchar (20));

       	 SET @MinMonth =Year(Dateadd(MONTH,-1,@StartDate)) * 100 +(Month(Dateadd(MONTH,-1,@StartDate)))
		 SET @StartMonth =Year(Dateadd(MONTH,+1,@StartDate)) * 100 +(Month(Dateadd(MONTH,+1,@StartDate)))

	 IF OBJECT_ID(N'tempdb..#temp11', N'U') IS NOT NULL
		DROP TABLE #temp11;
	
		SELECT 
			  p.Policyid,
			  CONVERT(datetime2,ISNULL(tmp.ModifiedDate,p.ModifiedDate),111) AS ModifiedDate,
			  ISNULL(pil.RolePlayerId,r.RolePlayerId) AS RolePlayerId,
			  crp.[DisplayName] AS Schemename,
			  br.[Name] [BrokerName],
			  [agent].FirstName + ' ' + [agent].SurnameOrCompanyName AS [AgentName],
			  [agent1].FirstName + ' ' + [agent1].SurnameOrCompanyName AS [JuristicRep],
			  papol.PolicyNumber AS ParentPolicyNumber,
			  p.PolicyNumber AS ChildPolicyNumber,
			   p.[ClientReference] AS AdsolPolicyNumber,
			  CASE WHEN cil.[Name] ='Main Member (self)' 
				   THEN CAST(ISNULL(tmp.InstallmentPremium,p.InstallmentPremium) AS DECIMAL(18,2))
				   ELSE 0 END AS InstallmentPremium,
			  p.[PolicyInceptionDate] [PolicyInceptionDate],
			  papol.InstallmentPremium AS GroupInstallmentPremiums,
			  cil.[Name] AS [Membertype],
			  pil.StartDate AS [LifeCommencementDate],
			  cpn.DateOfBirth,
			  cpn.IdNumber,
			  client.CalculateAge(isnull(cpn.DateOfBirth, p.PolicyInceptionDate)) [AgeAtInception],   
			  ISNULL(tmp.PolicyStatus,p.PolicyStatusId) AS PolicyStatusId,
			  ISNULL(cpsa.[Name],cps.[Name]) AS PolicyStatus,
			  CASE WHEN (p.[CreatedDate] BETWEEN @StartDate and @Enddate AND p.PolicyInceptionDate > @Enddate) THEN 'Pending' 
			       WHEN cps.[Name]='Continued' THEN 'Continued' 
				   WHEN cps.[Name] in ('Cancelled','Lapsed','Not Taken Up','Pending Cancelled','Paused','Pending Continuation') THEN 'Terminated' 
			       WHEN cm.CreatedDate BETWEEN @StartDate and @Enddate  THEN 'Claimed' 
				   ELSE ISNULL(cpsa.[Name],cps.[Name]) END AS MovementCode,
			  pcpsa.[Name] AS ParentPolicyStatus,
			  ils.[Name] AS MemberStatus,
			  pp.[Name] AS Product,
			  ppo.[Name] AS ProductOptionName,
			  cbr.BenefitAmount AS CoverAmount,
		      cci.AuthorisedAmount AS PaidAmount,
			  cdt.[name] AS CauseOfDeath,
			  CAST(pd.DeathDate AS DATE ) AS DeathDate,
			  CASE WHEN p.PolicyNumber LIKE '01%' THEN 'Funeral'
				   WHEN p.PolicyNumber LIKE '02%' THEN 'COID' 
				   ELSE 'Other' END AS ProductCategory

		INTO #temp11
		FROM POLICY.POLICY (NOLOCK) p
		LEFT JOIN #temp tmp  on p.policyid=tmp.PolicyId
		inner join common.PolicyStatus cps on p.PolicyStatusId = cps.Id
		left join common.PolicyStatus cpsa on tmp.PolicyStatus = cpsa.Id
		inner join product.ProductOption ppo on p.ProductOptionId = ppo.Id
		inner join product.Product pp on ppo.ProductId =pp.Id
		left join policy.policy papol on p.ParentPolicyId = papol.PolicyId
		left join [client].[RolePlayer] crp on papol.PolicyOwnerId =crp.RolePlayerId
		left join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
		inner join [broker].[Brokerage] br (nolock) on br.[Id] = p.[BrokerageId]
		inner join [broker].[Representative] [agent] ON p.RepresentativeId = [agent].Id
		left join [policy].PolicyInsuredLives (NOLOCK) pil ON pil.PolicyId=p.PolicyId and p.PolicyOwnerId =pil.RolePlayerId
		left join [Client].Person cpn ON  pil.RolePlayerId = cpn.RolePlayerId
		left join [common].InsuredLifeRolePlayerType (NOLOCK) cil ON pil.RolePlayerTypeId =cil.Id
		left join [product].[ProductOptionBenefit] ppob ON ppob.ProductOptionId = p.ProductOptionId and ppob.BenefitId = pil.StatedBenefitId
		left join [product].[BenefitRate] cbr with (nolock) on ppob.BenefitId = cbr.BenefitId
		left join [common].[InsuredLifeStatus] ils ON pil.InsuredLifeStatusId =ils.Id
		LEFT JOIN claim.personevent cpe ON pil.RolePlayerId=cpe.InsuredLifeId
		LEFT JOIN claim.Claim cm on cpe.PersonEventId =cm.PersonEventId
		LEFT JOIN client.RolePlayer IL on cpe.InsuredLifeId =IL.RolePlayerid and il.[RolePlayerIdentificationTypeId] = 1
		LEFT JOIN claim.ClaimInvoice cci on cm.Claimid =cci.ClaimId
		LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = cpe.PersonEventid 
		LEFT JOIN [common].[CauseOfDeathType]cdt ON cdt.id = pd.causeofdeath
		LEFT JOIN [common].[PolicyStatus] pcpsa on papol.PolicyStatusId = pcpsa.Id
		LEFT JOIN [policy].[PolicyBroker] ppb (nolock) ON [p].JuristicRepresentativeId = [ppb].JuristicRepId and [p].PolicyId = ppb.PolicyId and ppb.IsDeleted =0
        LEFT JOIN [broker].[Representative] [agent1] (NOLOCK) ON ppb.JuristicRepId = [agent1].Id


		WHERE  1 = CASE 
            WHEN @DateType = 0 THEN CASE WHEN p.[PolicyInceptionDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END
			WHEN @DateType = 1 THEN CASE WHEN p.ModifiedDate BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
			--WHEN @DateType = 2 THEN CASE WHEN B.[TransactionDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
            ELSE 1 END
		AND p.IsDeleted = 0
		AND (p.PolicyNumber = @PolicyNumber  or @PolicyNumber IS NULL)
		AND (crp.DisplayName = @Group OR  @Group IS NULL)
		AND ([br].[Name] = @Brokerage OR  @Brokerage IS NULL)
		AND (pp.Id = @ProductId or @ProductId is null )
		AND (p.CreatedDate between @StartDate and @EndDate
			OR  p.ModifiedDate between @StartDate and @EndDate)
		--AND p.policyid=188168--136861

		UNION ALL

		SELECT 
			  p.Policyid,
			  ISNULL(pil.ModifiedDate,p.ModifiedDate) AS ModifiedDate,
			  ISNULL(pil.RolePlayerId,r.RolePlayerId) AS RolePlayerId,
			  crp.[DisplayName] AS Schemename,
			  br.[Name] [BrokerName],
			  [agent].FirstName + ' ' + [agent].SurnameOrCompanyName AS [AgentName],
			  [agent1].FirstName + ' ' + [agent1].SurnameOrCompanyName AS [JuristicRep],
			  papol.PolicyNumber AS ParentPolicyNumber,
			  p.PolicyNumber AS ChildPolicyNumber,
			   p.[ClientReference] AS AdsolPolicyNumber,
			   0 AS InstallmentPremium,
			  p.[PolicyInceptionDate] [PolicyInceptionDate],
			  papol.InstallmentPremium AS GroupInstallmentPremiums,
			  cil.[Name] AS [Membertype],
			  pil.StartDate AS [LifeCommencementDate],
			  cpn.DateOfBirth,
			  cpn.IdNumber,
			  client.CalculateAge(isnull(cpn.DateOfBirth, p.PolicyInceptionDate)) [AgeAtInception],   
			  p.PolicyStatusId AS PolicyStatusId,
			  cps.[Name] AS PolicyStatus,
			  CASE WHEN p.PolicyInceptionDate < pil.StartDate  THEN 'Additional New Business' 
			       WHEN (pil.[CreatedDate] BETWEEN @StartDate and @Enddate) AND pil.EndDate IS NULL THEN 'New Business' 
				   WHEN (cm.CreatedDate BETWEEN @StartDate and @Enddate)   THEN 'Claimed' 
				   ELSE ils.[Name] END AS MovementCode,
			  pcpsa.[Name] AS ParentPolicyStatus,
			  ils.[Name] AS MemberStatus,
			  pp.[Name] AS Product,
			  ppo.[Name] AS ProductOptionName,
			  cbr.BenefitAmount AS CoverAmount,
		      cci.AuthorisedAmount AS PaidAmount,
			  cdt.[name] AS CauseOfDeath,
			  CAST(pd.DeathDate AS DATE ) AS DeathDate,
			  CASE WHEN p.PolicyNumber LIKE '01%' THEN 'Funeral'
				   WHEN p.PolicyNumber LIKE '02%' THEN 'COID' 
				   ELSE 'Other' END AS ProductCategory
		FROM POLICY.POLICY (NOLOCK) p
		inner join common.PolicyStatus cps on p.PolicyStatusId = cps.Id
		inner join product.ProductOption ppo on p.ProductOptionId = ppo.Id
		inner join product.Product pp on ppo.ProductId =pp.Id
		left join policy.policy papol on p.ParentPolicyId = papol.PolicyId
		left join [client].[RolePlayer] crp on papol.PolicyOwnerId =crp.RolePlayerId
		left join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
		inner join [broker].[Brokerage] br (nolock) on br.[Id] = p.[BrokerageId]
		inner join [broker].[Representative] [agent] ON p.RepresentativeId = [agent].Id
		left join [policy].PolicyInsuredLives (NOLOCK) pil ON pil.PolicyId=p.PolicyId --and p.PolicyOwnerId =pil.RolePlayerId
		left join [Client].Person cpn ON  pil.RolePlayerId = cpn.RolePlayerId
		left join [common].InsuredLifeRolePlayerType (NOLOCK) cil ON pil.RolePlayerTypeId =cil.Id
		left join [product].[ProductOptionBenefit] ppob ON ppob.ProductOptionId = p.ProductOptionId and ppob.BenefitId = pil.StatedBenefitId
		left join [product].[BenefitRate] cbr with (nolock) on ppob.BenefitId = cbr.BenefitId
		left join [common].[InsuredLifeStatus] ils ON pil.InsuredLifeStatusId =ils.Id
		LEFT JOIN claim.personevent cpe ON pil.RolePlayerId=cpe.InsuredLifeId
		LEFT JOIN claim.Claim cm on cpe.PersonEventId =cm.PersonEventId
		LEFT JOIN client.RolePlayer IL on cpe.InsuredLifeId =IL.RolePlayerid and il.[RolePlayerIdentificationTypeId] = 1
		LEFT JOIN claim.ClaimInvoice cci on cm.Claimid =cci.ClaimId
		LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = cpe.PersonEventid 
		LEFT JOIN [common].[CauseOfDeathType]cdt ON cdt.id = pd.causeofdeath
		LEFT JOIN [common].[PolicyStatus] pcpsa on papol.PolicyStatusId = pcpsa.Id
		LEFT JOIN [policy].[PolicyBroker] ppb (nolock) ON [p].JuristicRepresentativeId = [ppb].JuristicRepId and [p].PolicyId = ppb.PolicyId and ppb.IsDeleted =0
        LEFT JOIN [broker].[Representative] [agent1] (NOLOCK) ON ppb.JuristicRepId = [agent1].Id


		WHERE  1 = CASE 
            WHEN @DateType = 0 THEN CASE WHEN p.[PolicyInceptionDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END
			WHEN @DateType = 1 THEN CASE WHEN p.ModifiedDate BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
			--WHEN @DateType = 2 THEN CASE WHEN B.[TransactionDate] BETWEEN @startDate AND @endDate THEN 1 ELSE 0 END                                                    
            ELSE 1 END
		AND p.IsDeleted = 0
		AND (p.PolicyNumber = @PolicyNumber  or @PolicyNumber IS NULL)
		AND (crp.DisplayName = @Group OR  @Group IS NULL)
		AND ([br].[Name] = @Brokerage OR  @Brokerage IS NULL)
		AND (pp.Id = @ProductId or @ProductId is null )
		AND (p.CreatedDate between @StartDate and @EndDate
			OR  p.ModifiedDate between @StartDate and @EndDate)
		AND pil.RolePlayerTypeId <> 10
		--AND p.policyid=188168

		--SELECT * FROM #temp11							
        INSERT INTO #Finale([Policyid],
							[ModifiedDate],
							[RoleplayerID],
							[Schemename],
							[BrokerName],
							[AgentName],
							[JuristicRep],
							[ParentPolicyNumber],
							[ChildPolicyNumber],
							[AdsolPolicyNumber],
							[InstallmentPremium],
							[PolicyInceptionDate],
							[GroupInstallmentPremiums],
							[MemberType],
							[LifeCommencementDate],
							[DateofBirth],
							[IdNumber],
							[AgeAtInception],
							[PolicyStatusId],
							[PolicyStatus],
							[MovementCode],
							[ParentPolicyStatus],
							[MemberStatus],
							[Product],
							[ProductOptionName],
							[CoverAmount],
							[PaidAmount],
							[CauseOfDeath],
							[DeathDate],
							[ProductCategory])
			SELECT * FROM #temp11
			WHERE ([JuristicRep] = @JuristicRep  or @JuristicRep IS NULL)
			AND (policyid NOT IN ( Select parentpolicyid from @ParentPolicies))
			AND (RolePlayerId NOT IN (Select distinct roleplayerid from client.company))
	
	IF OBJECT_ID(N'tempdb..#FinalTemp', N'U') IS NOT NULL
		DROP TABLE #FinalTemp;

		CREATE TABLE #FinalTemp ([Policyid] int,
								 [ModifiedDate] Varchar(50),
								 [RoleplayerID] int,
								 [Schemename] varchar(255),
								 [BrokerName] varchar(255),
								 [AgentName] varchar(255),
								 [JuristicRep] varchar(255),
								 [ParentPolicyNumber] varchar(50),
								 [ChildPolicyNumber] varchar(50),
								 [AdsolPolicyNumber] varchar(50),
								 [InstallmentPremium] decimal(18,2),
								 [PolicyInceptionDate] date,
								 [GroupInstallmentPremiums] decimal(18,2),
								 [MemberType] varchar(50),
								 [LifeCommencementDate] date,
								 [DateofBirth] date,
								 [IdNumber] varchar(50),
								 [AgeAtInception] int,
								 [PolicyStatusId] int,
								 [PolicyStatus] varchar(50),
								 [MovementCode] varchar(50),
								 [ParentPolicyStatus] varchar(50),
								 [MemberStatus] varchar(20),[Product] varchar(50),
								 [ProductOptionName] varchar(100),
								 [CoverAmount] decimal(18,2),
								 [PaidAmount] decimal(18,2),
								 [CauseOfDeath] varchar(255),
								 [DeathDate] date,
								 [ProductCategory] varchar (20));


		MERGE #FinalTemp AS [Target]
		USING #Finale AS [Source]
		ON	(Target.[ChildPolicyNumber] = Source.[ChildPolicyNumber] 
			 AND Target.[ModifiedDate] =Source.[ModifiedDate]
			 AND Target.[RolePlayerID] =Source.[RolePlayerID]
			 )

	--1. UPDATE
		WHEN MATCHED AND
		((
				--([Target].[Policyid] <> [Source].[Policyid]  OR
				[Target].[ModifiedDate] <> [Source].ModifiedDate  OR
				[Target].[RoleplayerID] <> [Source].RoleplayerID  OR
				[Target].[Schemename] <> [Source].Schemename  OR
				[Target].[BrokerName] <> [Source].[BrokerName]  OR
				[Target].[AgentName] <> [Source].[AgentName]  OR				
				[Target].[JuristicRep] <> [Source].[JuristicRep]  OR
				[Target].[ParentPolicyNumber] <> [Source].ParentPolicyNumber  OR
				--[Target].[ChildPolicyNumber] <> [Source].ChildPolicyNumber  OR
				[Target].[AdsolPolicyNumber] <> [Source].[AdsolPolicyNumber] OR
				[Target].[InstallmentPremium] <> [Source].[InstallmentPremium] OR
				[Target].[PolicyInceptionDate] <> [Source].[PolicyInceptionDate] OR
				[Target].[GroupInstallmentPremiums] <> [Source].[GroupInstallmentPremiums]  OR				
				[Target].MemberType <> [Source].[MemberType] OR
				[Target].[LifeCommencementDate] <> [Source].[LifeCommencementDate]  OR
				[Target].DateofBirth <> [Source].DateofBirth  OR
				[Target].IdNumber <> [Source].IdNumber  OR
				[Target].AgeAtInception <> [Source].AgeAtInception  OR
				[Target].PolicyStatusId <> [Source].PolicyStatusId  OR
				[Target].PolicyStatus <> [Source].PolicyStatus  OR
				[Target].[MovementCode] <> [Source].[MovementCode]  OR				
				[Target].[ParentPolicyStatus] <> [Source].[ParentPolicyStatus] OR
				[Target].MemberStatus <> [Source].MemberStatus  OR
				[Target].Product <> [Source].Product  OR
				[Target].ProductOptionName <> [Source].ProductOptionName  OR
				[Target].CoverAmount <> [Source].CoverAmount  OR
				[Target].PaidAmount <> [Source].PaidAmount  OR
				[Target].CauseOfDeath <> [Source].CauseOfDeath OR
				[Target].DeathDate <> [Source].DeathDate OR 
				[Target].ProductCategory <> [Source].ProductCategory
		)) 
		 
		THEN UPDATE SET
				[Target].[Policyid] = [Source].[Policyid],
				[Target].[ModifiedDate] = [Source].[ModifiedDate],
				[Target].[RoleplayerID] = [Source].[RoleplayerID],
				[Target].[Schemename] = [Source].[Schemename],
				[Target].[BrokerName] = [Source].[BrokerName] ,	
				[Target].[AgentName] = [Source].[AgentName],
				[Target].[JuristicRep] = [Source].[JuristicRep],
				[Target].[ParentPolicyNumber] = [Source].[ParentPolicyNumber],
				[Target].[ChildPolicyNumber] = [Source].[ChildPolicyNumber],
				[Target].[AdsolPolicyNumber] = [Source].[AdsolPolicyNumber],
				[Target].[InstallmentPremium] = [Source].[InstallmentPremium],
				[Target].[PolicyInceptionDate] = [Source].[PolicyInceptionDate],
				[Target].[GroupInstallmentPremiums] = [Source].[GroupInstallmentPremiums],
				[Target].MemberType = [Source].[MemberType],
				[Target].[LifeCommencementDate] = [Source].[LifeCommencementDate],
				[Target].DateofBirth = [Source].[DateofBirth],
				[Target].IdNumber = [Source].[IdNumber],
				[Target].AgeAtInception = [Source].[AgeAtInception],
				[Target].PolicyStatusId = [Source].[PolicyStatusId],
				[Target].PolicyStatus = [Source].[PolicyStatus],
				[Target].[MovementCode] = [Source].[MovementCode],	
				[Target].[ParentPolicyStatus] = [Source].[ParentPolicyStatus],
				[Target].MemberStatus = [Source].[MemberStatus],
				[Target].Product = [Source].[Product],
				[Target].ProductOptionName = [Source].[ProductOptionName],
				[Target].CoverAmount = [Source].[CoverAmount],
				[Target].PaidAmount = [Source].[PaidAmount],
				[Target].CauseOfDeath = [Source].[CauseOfDeath],
				[Target].DeathDate = [Source].[DeathDate],
				[Target].ProductCategory = [Source].[ProductCategory]

		--2. INSERT
		WHEN NOT MATCHED BY TARGET THEN INSERT
		(
				[Policyid],
				[ModifiedDate],
				[RoleplayerID],
				[Schemename],
				[BrokerName],
				[AgentName],
				[JuristicRep],	
				[ParentPolicyNumber],
				[ChildPolicyNumber],
				[AdsolPolicyNumber],
				[InstallmentPremium],
				[PolicyInceptionDate],
				[GroupInstallmentPremiums],
				[MemberType],
				[LifeCommencementDate],
				[DateofBirth],
				[IdNumber],
				[AgeAtInception],
				[PolicyStatusId],
				[PolicyStatus],
				[MovementCode],
				[ParentPolicyStatus],
				[MemberStatus],
				[Product],
				[ProductOptionName],
				[CoverAmount],
				[PaidAmount],
				[CauseOfDeath],
				[DeathDate],
				[ProductCategory]


		)
		VALUES
		(
				[Source].[Policyid],
				[Source].[ModifiedDate],
				[Source].[RoleplayerID],
				[Source].[Schemename],
				[Source].[BrokerName],
				[Source].[AgentName],
				[Source].[JuristicRep],
				[Source].[ParentPolicyNumber],
				[Source].[ChildPolicyNumber],
				[Source].[AdsolPolicyNumber],
				[Source].[InstallmentPremium],
				[Source].[PolicyInceptionDate],
				[Source].[GroupInstallmentPremiums],
				[Source].[MemberType],
				[Source].[LifeCommencementDate],
				[Source].[DateofBirth],
				[Source].[IdNumber],
				[Source].[AgeAtInception],
				[Source].[PolicyStatusId],
				[Source].[PolicyStatus],
				[Source].[MovementCode],	
				[Source].[ParentPolicyStatus],
				[Source].[MemberStatus],
				[Source].[Product],
				[Source].[ProductOptionName],
				[Source].[CoverAmount],
				[Source].[PaidAmount],
				[Source].[CauseOfDeath],
				[Source].DeathDate,
				[Source].[ProductCategory]

		)
		;


	SELECT --124353
			ROW_NUMBER() OVER (PARTITION BY RoleplayerId,PolicyId ORDER BY ModifiedDate ASC) AS Movement_Sequence_Number,
			ROW_NUMBER() OVER (PARTITION BY RoleplayerId,PolicyId ORDER BY ModifiedDate DESC) AS Reverse_Movement_Sequence_Number,
			A.*
	FROM (
			 SELECT DISTINCT *
			 FROM #Finale
			 --WHERE ChildPolicyNumber='01-202203-188168'
		 ) A
		 ORDER BY Roleplayerid,ModifiedDate asc
END