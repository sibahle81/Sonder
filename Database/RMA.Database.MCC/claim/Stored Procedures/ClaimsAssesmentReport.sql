--exec [claim].[ClaimsAssesmentReport] '2017-02-17','2020-11-17','Above 30K','ALL','ALL'
CREATE   PROCEDURE [claim].[ClaimsAssesmentReport]
	@DateFrom As varchar(20),
	@DateTo AS varchar(20),
	@ProductOption VARCHAR(MAX),
	@Brokerage AS VARCHAR(MAX),
	@Scheme AS VARCHAR(MAX)
	
AS
BEGIN

 DECLARE  @SQLQUERY NVARCHAR(MAX)
	
	 SET @SQLQUERY ='

	 IF OBJECT_ID(N''tempdb..#TempClaimNote'', N''U'') IS NOT NULL
			DROP TABLE #TempClaimNote;

		SELECT DISTINCT
			 FIRST_VALUE([CLAIMID]) OVER (PARTITION BY [ClaimID] ORDER BY [ModifiedDate] DESC) AS [ClaimID],
			 FIRST_VALUE([TEXT]) OVER (PARTITION BY [ClaimID] ORDER BY [ModifiedDate] DESC) AS [Text]

	    INTO #TempClaimNote
		FROM [Claim].[ClaimNote]

SELECT DISTINCT
			pe.DateCaptured				[CaptureDate], 
			clm.modifieddate			[DecisionDate ],
			channel.name				[Channel],					
			dt.name						[Type of Death],
			cdt.name					[Cause Of Death] ,
		
			brg.name					[Brokerage], 
			bpre.Code	 				[Broker],
			pol.policynumber			[Policy Number],
			parp.DisplayName			[Scheme],
			ppr.[Name]					[Product],
			prod.Name       			[ProductOption],
			br.benefitamount			[Benefit Amount], 			
			pers.FirstName				[Deceased Name],
			pers.surname				[Deceased Surname],
			pd.deathdate				[Date of Death]	,
			(select Top 1 CAST(StartDateTime As date) from Claim.ClaimWorkflow where claimStatusId in (5) and claimid = clm.ClaimId order by ClaimWorkflowId 	)				[Date Pended],
			(select Top 1 CAST(StartDateTime As date) from Claim.ClaimWorkflow where claimStatusId in (4) and claimid = clm.ClaimId order by ClaimWorkflowId desc	)			    [Date last requirement Received] ,
			isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)						[Claim number]	,
			bpre.SurnameOrCompanyName	[Company name],
			pol.PolicyInceptionDate		[Date of Commencement]	,
			users.displayname			[Assessor]	,
			'' ''					[List of outstanding requirements],
			tcn.Text					[LastNote]

			

		    FROM [claim].[Claim]					(NOLOCK) clm 
			LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			INNER JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			INNER JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			LEFT JOIN [common].[CauseOfDeathType]cdt ON cdt.id = pd.causeofdeath
		    INNER JOIN [policy].[PolicyInsuredLives] pil ON(( pe.InsuredLifeId=pil.RolePlayerId) AND (clm.PolicyId=pil.PolicyId))
			INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
			LEFT JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			 JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId
			LEFT JOIN [product].[ProductOptionBenefit] pob ON pob.ProductOptionId = pol.ProductOptionId
			left join claim.claimbenefit ben ON ben.claimid = clm.claimid
			LEFT JOIN [product].BenefitRate br ON br.BenefitId =pil.StatedBenefitId
			LEFT JOIN [claim].[claimworkflow](NOLOCK)workflow ON workflow.claimid=clm.claimid
			LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
			LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
			LEFT JOIN #TempClaimNote tcn on clm.[ClaimId] = tcn.[ClaimId]
		
		WHERE clm.ClaimStatusId IN (4) AND
			clm.CreatedDate BETWEEN ''' + @DateFrom   + ''' AND ''' +  @DateTo +'''' 


   IF @ProductOption <>'All'
		BEGIN
		    SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
			SET  @SQLQUERY += '  AND prod.Name IN (select value from string_split('''+ @ProductOption + ''','',''))'
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
			[CaptureDate] DATE,
			[DecisionDate] DATETIME,
			Channel VARCHAR(50),
			[Type of Death] VARCHAR(50),
			[Cause Of Death] VARCHAR(50),
			[Brokerage] VARCHAR(100),
			[Broker] VARCHAR(100),
			[Policy Number] VARCHAR(20),
			[Scheme] VARCHAR(100),
			[Product] VARCHAR(100),
			[ProductOption] VARCHAR(100),
			[Benefit Amount] MONEY,
			[Deceased Name] VARCHAR(100), 
			[Deceased Surname] VARCHAR(100), 
			[Date of Death]	DATETIME,
			[Date Pended] DATETIME,
			[Date last requirement Received] DATETIME,
			[Claim number]	VARCHAR(20),
			[Company name] VARCHAR(100),
			[Date of Commencement] DATETIME,
			[Assessor] VARCHAR(100), 
			[List of outstanding requirements] VARCHAR(255),
			[LastNote] VARCHAR(MAX));

	
	  INSERT INTO @Claim  EXECUTE SP_EXECUTESQL @SQLQUERY

	  SELECT  * FROM @Claim	

END
GO


