



-- =============================================
-- Author:		Sanele Ngidi
-- Create date: 2019-10-16
-- Description:	[claim].[ClaimsRepudiationReport] '2017-01-01','2021-01-01','Funeral-Up to 30K','RAND MUTUAL ADMIN SERVICES (PTY) LTD','ALL'
-- =============================================

CREATE PROCEDURE [claim].[ClaimsRepudiationReport]
	@DateFrom As varchar(20),
	@DateTo AS varchar(20),
	@Product VARCHAR(MAX),	
	@Brokerage AS VARCHAR(MAX),
	@Scheme AS VARCHAR(MAX)

AS
BEGIN
	
	DECLARE  @SQLQUERY NVARCHAR(MAX)

	 SET @SQLQUERY ='	

			SELECT DISTINCT
				clm.claimid,
			pe.DateCaptured														[Date Captured],
			(Select Top 1 StartDateTime  from Claim.ClaimWorkflow where claimStatusId in (4) And ClaimId = clm.ClaimId 
			order by ClaimWorkflowId)											[Decision Date],
			(Select Top 1 EndDateTime  from Claim.ClaimWorkflow where claimStatusId in (4,26) And ClaimId = clm.ClaimId 
			order by ClaimWorkflowId desc)											[DateLetterSent],
			ISNULL(DATEDIFF(minute,(Select Top 1 StartDateTime  from Claim.ClaimWorkflow where claimStatusId in (4) And ClaimId = clm.ClaimId 
			order by ClaimWorkflowId),(Select Top 1 EndDateTime  from Claim.ClaimWorkflow where claimStatusId in (4,26) And ClaimId = clm.ClaimId 
			order by ClaimWorkflowId desc)),0)										[LAGDecisionMadetoLetterSent],
			channel.name														[Channel],
			ISNULL(users.displayname,users1.displayname)						[Assessor],
			brg.name															[Brokerage],
			bpre.Code															[Broker],
			parp.DisplayName													[Scheme],
			bpre.SurnameOrCompanyName											[Company Name],
			pers.FirstName														[Deceased name]	,
			pers.Surname														[Deceased Surname],
			pers.IdNumber														[Deceased IdNumber],
			pol.PolicyNumber													[Policy Number]	,
			ISNULL (clm.claimreferencenumber, pe.Personeventreferencenumber)	[Claim Number],
			pol.PolicyInceptionDate												[Date of commencement],
			pd.deathdate														[Date of Death]	,
			--rate.benefitamount												[Benefit Amount], 
			cca.TotalAmount														[Benefit Amount], 
			sts.Status															[Claim Status],
			reasons.name														[Reason for Decline],
			dt.name																[Type of Death],
			ppr.Name															[Product],
			polpers.FirstName                                                      [MainMemberFirstName],
			polpers.Surname														[MainMemberLastName],
			inv.ClaimInvoiceDeclineReasonId
		
			FROM 
			[claim].[Claim] (NOLOCK) clm 
			left join [claim].[funeralinvoice]inv(NOLOCK) ON clm.personeventid = inv.referencenumber
			 join [common].[ClaimInvoiceDeclineReason] reasons (NOLOCK) ON reasons.id = inv.ClaimInvoiceDeclineReasonId
			LEFT JOIN [claim].[PersonEvent]		(NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			INNER JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyId
			LEFT JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			inner JOIN [claim].[claimstatus](NOLOCK)cs ON cs.claimstatusid = clm.claimstatusid
			left JOIN [common].[communicationtype](NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId
			JOIN claim.claimstatus sts ON sts.ClaimStatusId = clm.ClaimStatusId 
			left JOIN [claim].[claimworkflow](NOLOCK)workflowAssesor ON workflowAssesor.claimid=clm.claimid and workflowAssesor.claimstatusid=1
			left JOIN [security].[User](NOLOCK) users1 ON users1.id = workflowAssesor.AssignedToUserId
			INNER JOIN [claim].[ClaimsCalculatedAmount] cca ON cca.ClaimId = clm.ClaimId
			LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
			LEFT JOIN [client].[roleplayer] parp on parp.RolePlayerId = papol.policyOwnerId
			INNER JOIN [client].[Person] polpers on polpers.RolePlayerId = pol.policyOwnerId


		WHERE
			clm.ClaimStatusId IN (10)
			AND clm.CreatedDate BETWEEN ''' + @DateFrom   + ''' AND ''' +  @DateTo +''''


		
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
	
		--print (@SQLQUERY)
			
	DECLARE @Claim AS TABLE(
			claimId INT,
			[Date Captured] DATE,
			DecisionDate DATETIME,
			[DateLetterSent]  DATETIME,
			[LAGDecisionMadetoLetterSent] INT,
			Channel VARCHAR(50),
			Assessor VARCHAR(50),
			Brokerage VARCHAR(100),
			[Broker] VARCHAR(100),
			Scheme	VARCHAR(100),
			CompanyName VARCHAR(100),
			DeceasedName  VARCHAR(200),
			DeceasedSurname VARCHAR(200),
			DeceasedIdNumber VARCHAR(20),
			PolicyNumber VARCHAR(20),
			[Claim Number] VARCHAR(20),
			[Date of commencement] DATE,
			[Date of Death] DATE,
			[Benefit Amount] MONEY, 
			[Claim Status] VARCHAR(50),
			[Reason for Decline] VARCHAR(255),
			[Type of Death] VARCHAR(50),
			Product VARCHAR(100),
		    MainMemberFirstName VARCHAR(100),
			MainMemberLastName VARCHAR(100),
			ClaimInvoiceDeclineReasonId INT);

	INSERT INTO @Claim  EXECUTE SP_EXECUTESQL @SQLQUERY

	SELECT  * FROM @Claim 

END

