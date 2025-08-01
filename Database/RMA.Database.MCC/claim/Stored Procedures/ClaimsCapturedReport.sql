 CREATE PROCEDURE [claim].[ClaimsCapturedReport]
	@DateFrom As varchar(20),
	@DateTo AS varchar(20),
	@ProductOption VARCHAR(MAX),
	@Brokerage AS VARCHAR(MAX),
	@Channel AS VARCHAR(MAX),
	@Scheme AS VARCHAR(MAX)
	
	
AS
BEGIN   
        DECLARE  @SQLQUERY NVARCHAR(MAX)
	

	
	 SET @SQLQUERY ='


	 SELECT DISTINCT
			clm.claimId,
				
			clm.CreatedDate				[RegistrationDate],
			pe.DateCaptured				[Date Captured],
			isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)	[Claim Number],
			channel.name				[Channel],
			ISNULL(users.displayname,users1.displayname)    [Assessor],
			pers.FirstName				[Deceased name]	,
			pers.Surname				[Deceased Surname],
			ppr.[Name]					[Product],
			prod.[description]			[ProductOption],
			pol.PolicyNumber			[Policy Number]	,
			dt.name						[Type of Death],
			pd.deathdate				[Date of Death]	,
			brg.name					[Brokerage],
			bpre.Code					[Broker],
			parp.DisplayName			[Scheme],
			bpre.SurnameOrCompanyName	[Company Name]	,
			pol.PolicyInceptionDate		[Date of commencement]
			
			
			FROM [claim].[Claim] (NOLOCK) clm 
			LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			LEFT JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			left JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
			--LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.claimid = clm.claimid
			LEFT JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId
			LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
			LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
			LEFT JOIN [claim].[claimworkflow](NOLOCK)workflowAssesor ON clm.claimid=workflowAssesor.claimid and workflowAssesor.claimstatusid=1
			LEFT JOIN [security].[User](NOLOCK) users1 ON users1.id = workflowAssesor.AssignedToUserId

		WHERE
			clm.CreatedDate BETWEEN ''' + @DateFrom   + ''' AND ''' +  @DateTo +'''' 


   IF @ProductOption <>'All'
		BEGIN
		   
			SET  @SQLQUERY += '  AND prod.Name IN (select value from string_split('''+ '' +  @ProductOption +''+ ''','',''))'''''
		
		END

      IF @Brokerage <>'All'
		BEGIN
			SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
			SET  @SQLQUERY += ' AND brg.Name IN (select value from string_split('''+ @Brokerage +''','',''))'
		END


	IF @Channel <>'All'
		BEGIN
		    SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
			SET  @SQLQUERY += ' AND channel.Name IN (select value from string_split('''+ @Channel +''','',''))'
	
		END

	IF @Scheme <>'All'
		BEGIN
		    SET  @SQLQUERY =Replace(@SQLQUERY,'''''','')
		    SET  @SQLQUERY += ' AND parp.DisplayName IN (select value from string_split('''+ @Scheme +''','',''))'
		END


		DECLARE @Claim AS TABLE(

			Id INT,
			RegistrationDate DATETIME,
			DateCaptured DATETIME,
			ClaimNumber VARCHAR(20),
			Channel VARCHAR(50), 
			Assessor VARCHAR(100),
			DeseasedName VARCHAR(100), 
			DeseasedSurname VARCHAR(100),
			Product VARCHAR(100),
			ProductOption VARCHAR(50), 
			PolicyNumber VARCHAR(20),
			TypeOfDeath VARCHAR(50),
			DateOfDeath VARCHAR(20),
			Brokerage VARCHAR(100),
			[Broker] VARCHAR(100),	 
			Scheme VARCHAR(100), 
			CompanyName VARCHAR(100),
			DateOfCommencement DATETIME);

	
	  INSERT INTO @Claim  EXECUTE SP_EXECUTESQL @SQLQUERY

	  SELECT  * FROM @Claim	ORDER BY datecaptured desc
	
	
END

GO