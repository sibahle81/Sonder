--exec [claim].[ClaimsNotificationReport1] @DateFrom='2020-02-17',@DateTo='2020-11-17'
CREATE   PROCEDURE [claim].[ClaimsNotificationReport1]
	@DateFrom As Date,
	@DateTo AS Date
AS

BEGIN
	
	DECLARE @Claim AS TABLE(
			clmId INT,
			DateRegistered DATETIME,
			DateOfCommencement DATETIME,
			Channel VARCHAR(50), 
			TypeOfDeath VARCHAR(50),
			DeseasedName VARCHAR(100), 
			DeseasedSurname VARCHAR(100), 
			PolicyNumber VARCHAR(20), 
			Brokerage VARCHAR(100), 
			
			BenefitAmount MONEY, 
			DateOfDeath DATETIME, 
			Product VARCHAR(100), 
			CompanyName VARCHAR(100), 
			[Broker] VARCHAR(100), 
			Scheme VARCHAR(100), 
			ClaimNumber VARCHAR(20), 
			[User] VARCHAR(100));

	INSERT INTO @Claim
	SELECT DISTINCT
			
			clm.claimId,
			clm.CreatedDate				[Date Registrated], 
			pol.policyInceptionDate		[Date of commencement],
			channel.name				[Channel],					
			dt.name						[Type of Death],
			pers.FirstName				[Deceased name]	,
			pers.Surname				[Deceased Surname], 
			pol.PolicyNumber			[Policy Number]	, 
			brg.name					[Brokerage], 
			--br.benefitamount			[Benefit Amount], 
			cca.TotalAmount				[Benefit Amount], 
			pd.deathdate				[Date of Death], 
			prod.name					[Product],
			bpre.SurnameOrCompanyName	[Company name],
			bpre.Code   				[Broker],
			prod.name					[Scheme],
			isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)	[Claim Number], 
			clm.createdby				[User]

		FROM [claim].[Claim] (NOLOCK) clm 
			LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			 JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			left JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
			----LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.policyid = pol.policyid
			--LEFT  JOIN [claim].ClaimBenefit cb ON cb.ClaimId = clm.ClaimId
			LEFT JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			left JOIN [product].[ProductOptionBenefit] pob ON pob.ProductOptionId = pol.ProductOptionId
   --         --JOIN [product].BenefitRate br ON br.BenefitId = pob.BenefitId
			--left JOIN [product].BenefitRate br ON br.BenefitId = cb.BenefitId
			INNER JOIN [claim].[ClaimsCalculatedAmount] cca ON cca.ClaimId = clm.ClaimId
			
		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo 

		SELECT * FROM @Claim ORDER BY DateRegistered DESC
END
