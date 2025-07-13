

----exec  [claim].[ClaimsCancellationReport]'2017-01-01','2021-01-01','Funeral (Up to 30K)','ALL','ALL'

CREATE PROCEDURE [claim].[ClaimsCancellationReport]
	@DateFrom As varchar(20),
	@DateTo AS varchar(20),
	@Product VARCHAR(MAX),
	@Brokerage AS VARCHAR(MAX),
	@Scheme AS VARCHAR(MAX)
	
AS
BEGIN

DECLARE
      @SQLQUERY NVARCHAR(MAX)

	 SET @SQLQUERY ='

	 IF OBJECT_ID(N''tempdb..#Tempclaimworkflow'', N''U'') IS NOT NULL
			DROP TABLE #Tempclaimworkflow;

		SELECT DISTINCT
			 FIRST_VALUE([CLAIMID]) OVER (PARTITION BY [ClaimID] ORDER BY [ClaimWorkflowId],[EndDateTime] DESC) AS [ClaimID],
			 FIRST_VALUE([claimstatusid]) OVER (PARTITION BY [ClaimID] ORDER BY [ClaimWorkflowId],[EndDateTime] DESC) AS [claimstatusid],
			 FIRST_VALUE([AssignedToUserId]) OVER (PARTITION BY [ClaimID] ORDER BY [ClaimWorkflowId],[EndDateTime] DESC) AS [AssignedToUserId]

	    INTO #Tempclaimworkflow 
		FROM [claim].[claimworkflow](NOLOCK)

	SELECT DISTINCT
			clm.claimId,
			CLM.modifieddate								[Decision Date],
			(select Top 1 CAST(StartDateTime As date) from Claim.ClaimWorkflow where claimid = clm.ClaimId order by ClaimWorkflowId desc)			[Cancellation Date]	,
			channel.name							[Channel],
			ISNULL(users.displayname,users1.displayname)						[Assessor],
			brg.name								[BrokerageName],
			bpre.SurnameOrCompanyName				[BrokerName],
			ppr.Name								[Product],
			parp.DisplayName						[Scheme],  
			prod.name								[ProductOption], 
			bpre.SurnameOrCompanyName				[Company name],								
			concat(pers.firstname,pers.surname) AS [DeseasedName],
			pol.policynumber						[Policy Number],
			isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)[Claim number]	,
			clm.CreatedDate							[Date of Commencement]	,
			pd.deathdate							[Date of Death]	,
			cca.TotalAmount							[Benefit Amount],
			sts.description    						[Reason for cancellation],
			dt.name									[Type of Death],
			cdt.Name								[causeofdeath],
			pers.IdNumber														[Deceased IdNumber],
			rpt.name								[Relationship(tomainmember)],
			pol.AnnualPremium						[Premium],
			polpers.FirstName                       [MainMemberFirstName],
			polpers.Surname                         [MainMemberLastName]
		FROM 
			[claim].[Claim] (NOLOCK) clm 
			LEFT JOIN [claim].[PersonEvent]		(NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			INNER JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			INNER JOIN common.CauseOfDeathType (NOLOCK) cdt ON pd.DeathTypeId=cdt.Id 
			INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId	
			LEFT JOIN #Tempclaimworkflow workflow ON workflow.claimid=clm.claimid
			LEFT JOIN [security].[User](NOLOCK) users1 ON users1.id = workflow.AssignedToUserId
			LEFT JOIN [client].[Person](NOLOCK)pers ON pers.roleplayerid = pe.insuredlifeid
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [claim].[ClaimBenefit](NOLOCK) ben ON ben.claimid = clm.claimid
			LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
			LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId

			--LEFT JOIN product.BenefitRate (NOLOCK) rate ON rate.benefitid = ben.benefitid
			JOIN claim.claimstatus sts (NOLOCK) ON sts.ClaimStatusId= clm.ClaimStatusId
			JOIN [policy].policyInsuredLives pil ON pil.RolePlayerId = pe.InsuredLifeId
            JOIN client.RolePlayerType rpt ON rpt.RolePlayerTypeId = pil.RolePlayerTypeId
			INNER JOIN [claim].[ClaimsCalculatedAmount] cca ON cca.ClaimId = clm.ClaimId
			INNER JOIN [client].[Person] polpers on polpers.RolePlayerId = pol.policyOwnerId
			

		WHERE
			clm.ClaimStatusId IN (7) AND 
			clm.CreatedDate BETWEEN ''' + @DateFrom   + ''' AND ''' +  @DateTo +''''
		
	
   IF @Product <>'All'
		BEGIN
		   	SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')			
			SET  @SQLQUERY += '  AND ppr.Name IN (select value from string_split('''+ @Product + ''','',''))'
			--SET  @SQLQUERY += '  AND ppr.Name IN (select value from string_split('''+ '' +  @Product +''+ ''','',''))'''''
		
		END


      IF @Brokerage <>'All'
		BEGIN
			SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
			SET  @SQLQUERY += ' AND brg.Name IN (select value from string_split('''+ @Brokerage +''','',''))'
		END


	IF @Scheme <>'All'
		BEGIN
		    SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
		    SET  @SQLQUERY += ' AND parp.DisplayName IN (select value from string_split('''+ @Scheme +''','',''))'
		END	
		

			DECLARE @Claim AS TABLE(
					claimId INT,
					[Decision Date] DATE,
					[Cancellation Date]	 DATE,
					[Channel] VARCHAR(50),
					[Assessor] VARCHAR(100),
					[BrokerageName] VARCHAR(100),
					[BrokerName] VARCHAR(100),
					[Product] VARCHAR(100),
					[Scheme] VARCHAR(100), 
					[ProductOption] VARCHAR(100),
					[Company name] VARCHAR(100),								
					[DeseasedName] VARCHAR(255),
					[Policy Number]	VARCHAR(20),
					[Claim number]	  VARCHAR(20),
					[Date of Commencement] DATE,
					[Date of Death] DATE,
					[Benefit Amount] INT,
					[Reason for cancellation]  VARCHAR(MAX),
					[Type of Death] VARCHAR(50),
					[causeofdeath] VARCHAR(250),		
					[Relationship(tomainmember)]  VARCHAR(50),
					[MainMemberFirstName] VARCHAR(100),
					[MainMemberLastName] VARCHAR(100),
					[Deceased IdNumber] VARCHAR(20),
					[Premium] INT);

	INSERT INTO @Claim  EXECUTE SP_EXECUTESQL @SQLQUERY

			--print (@SQLQUERY)

	SELECT  * FROM @Claim	ORDER BY [Cancellation Date] desc
	

END