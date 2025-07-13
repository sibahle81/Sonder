





-- =============================================
-- Author:		Sanele Ngidi
-- Create date: 2019-10-16
-- Description:	
-- =============================================
CREATE PROCEDURE [claim].[ClaimsCapturedReport1]
	@DateFrom As Date,
	@DateTo AS Date
	--@ClaimStatusId As INT = 0
AS
BEGIN
	
	DECLARE @Claim AS TABLE(
			/*Id INT,
			DateRegistered DATETIME,
			DateCaptured DATETIME,
			ClaimNumber VARCHAR(20),
			Channel VARCHAR(50), 
			Assessor VARCHAR(100),
			DeseasedName VARCHAR(100), 
			DeseasedSurname VARCHAR(100),
			Product VARCHAR(100), 
			PolicyNumber VARCHAR(20),
			TypeOfDeath VARCHAR(50),
			Brokerage VARCHAR(100),
			BenefitAmount MONEY,  
			DateOfDeath DATETIME,  
			[Broker] VARCHAR(100), 
			Scheme VARCHAR(100), 
			CompanyName VARCHAR(100),
			DateOfCommencement DATETIME);*/

			Id INT,
			RegistrationDate DATETIME,
			DateCaptured DATETIME,
			ClaimNumber VARCHAR(20),
			Channel VARCHAR(50), 
			Assessor VARCHAR(100),
			DeseasedName VARCHAR(100), 
			DeseasedSurname VARCHAR(100),
			Product VARCHAR(100), 
			PolicyNumber VARCHAR(20),
			TypeOfDeath VARCHAR(50),
			DateOfDeath VARCHAR(20),
			[Broker] VARCHAR(100),	 
			Scheme VARCHAR(100), 
			CompanyName VARCHAR(100),
			DateOfCommencement DATETIME);

	INSERT INTO @Claim
	
			SELECT DISTINCT
			clm.claimId,
				
			clm.CreatedDate				[RegistrationDate],
			pe.DateCaptured				[Date Captured],
			isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)	[Claim Number],
			channel.name				[Channel],
			users.displayname		    [Assessor],
			pers.FirstName				[Deceased name]	,
			pers.Surname				[Deceased Surname],
			pay.product					[Product],
			pol.PolicyNumber			[Policy Number]	,
			dt.name						[Type of Death],
			pd.deathdate				[Date of Death]	,
			bpre.Code					[Broker],
			prod.name					[Scheme],
			bpre.SurnameOrCompanyName	[Company Name]	,
			pol.PolicyInceptionDate		[Date of commencement]
			
	
			FROM [claim].[Claim] (NOLOCK) clm 
			LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			LEFT JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			left JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
			LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.policyid = pol.policyid
			LEFT JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId
		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo 
	

		SELECT * FROM @Claim	ORDER BY datecaptured desc
END