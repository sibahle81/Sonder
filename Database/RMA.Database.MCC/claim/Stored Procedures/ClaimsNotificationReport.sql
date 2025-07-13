
CREATE PROCEDURE [claim].[ClaimsNotificationReport] --'2021-04-01', '2021-06-30','ALL','ALL','ALL'
	@DateFrom As varchar(20),
	@DateTo AS varchar(20),
	@ProductOption VARCHAR(MAX),
	@Brokerage AS VARCHAR(MAX),
	@Scheme AS VARCHAR(MAX)

AS
BEGIN
	DECLARE  @SQLQUERY NVARCHAR(MAX)
	
	 SET @SQLQUERY ='
	
		SELECT DISTINCT
			ct.[Description]			[Client Type],			
			clm.claimId,
			clm.CreatedDate				[Date Registrated], 
			pol.policyInceptionDate		[Date of commencement],
			channel.name				[Channel],					
			dt.name						[Type of Death],
			pers.FirstName				[Deceased name]	,
			pers.Surname				[Deceased Surname], 
			pol.PolicyNumber			[Policy Number]	, 
			cps.Name					[Policy Status]	, 
			brg.name					[Brokerage], 
			cca.TotalAmount				[Benefit Amount], 
			pd.deathdate				[Date of Death], 
			ppr.[Name]					[Product],
			prod.Name       			[ProductOption],
			bpre.SurnameOrCompanyName	[Company name],
			bpre.Code   				[Broker],
			parp.DisplayName			[Scheme],
			isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)	[Claim Number], 
			clm.createdby				[User],
			(Select Top 1 EndDateTime  from Claim.ClaimWorkflow where claimStatusId in (13,14) And ClaimId = clm.ClaimId 
			order by ClaimWorkflowId desc) [Date Notified],	
			CASE WHEN pol.IsEuropAssist = 1 
				 THEN ''Yes'' ELSE ''No''
				 END AS				[Europ Assist Indicator]


			
		FROM [claim].[Claim] (NOLOCK) clm 
		     JOIN [claim].ClaimBenefit cb ON cb.ClaimId = clm.ClaimId
			 LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
		     JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			 JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			 JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
			--LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.policyid = pol.policyid
			JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			INNER JOIN [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			INNER JOIN [product].[ProductOptionCoverType](NOLOCK) poct ON prod.Id = poct.ProductOptionId
			INNER JOIN [common].[CoverType](NOLOCK) ct ON poct.CoverTypeId = ct.Id
			LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			JOIN [product].[ProductOptionBenefit] pob ON pob.ProductOptionId = pol.ProductOptionId
            --JOIN [product].BenefitRate br ON br.BenefitId = pob.BenefitId
			-- JOIN [claim].ClaimBenefit br ON br.ClaimId = clm.ClaimId
			LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
			LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
			INNER JOIN [claim].[ClaimsCalculatedAmount] cca ON cca.ClaimId = clm.ClaimId
			LEFT JOIN [common].[PolicyStatus] (NOLOCK) cps ON cps.Id = pol.policystatusid
			
		WHERE
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
		
		--print (@SQLQUERY)

		DECLARE @Claim AS TABLE(
		    ClientType VARCHAR(15),
			clmId INT,
			DateRegistered DATETIME,
			DateOfCommencement DATETIME,
			Channel VARCHAR(50), 
			TypeOfDeath VARCHAR(50),
			DeseasedName VARCHAR(100), 
			DeseasedSurname VARCHAR(100), 
			PolicyNumber VARCHAR(20),
			PolicyStatus VARCHAR(50),
			Brokerage VARCHAR(100), 			
			BenefitAmount MONEY, 
			DateOfDeath DATETIME, 
			Product VARCHAR(100), 
			[ProductOption] VARCHAR(100),
			CompanyName VARCHAR(100), 
			[Broker] VARCHAR(100), 
			Scheme VARCHAR(100), 
			ClaimNumber VARCHAR(20), 
			[User] VARCHAR(100),
			DateNotified DATETIME, 
			EuropAssistIndicator VARCHAR(5));

	INSERT INTO @Claim  EXECUTE SP_EXECUTESQL @SQLQUERY

		SELECT * FROM @Claim ORDER BY DateRegistered DESC
END
GO


