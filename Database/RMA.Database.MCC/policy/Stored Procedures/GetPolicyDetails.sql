-- EXEC [policy].[GetPolicyDetails] 5321
CREATE   PROCEDURE [policy].[GetPolicyDetails]
	@PolicyId INT
AS
BEGIN
	DECLARE
	@CommissionPercentage FLOAT = 0.00,
	@AdminPercentage FLOAT = 0.00,
	@PaymentFrequency FLOAT = 0.00,
	@multiplier INT = 1 

	DECLARE @PaymentFrequencyTable Table (MultiPlierValue INT, PaymentFrequency INT)
	INSERT @PaymentFrequencyTable (MultiPlierValue, PaymentFrequency) VALUES (12,1); -- Annually
	INSERT @PaymentFrequencyTable (MultiPlierValue, PaymentFrequency) VALUES (1,2);  -- Monthly
	INSERT @PaymentFrequencyTable (MultiPlierValue, PaymentFrequency) VALUES (3,3);  -- Quartely
	INSERT @PaymentFrequencyTable (MultiPlierValue, PaymentFrequency) VALUES (6,4);  -- BiAnnualy

	

	SELECT TOP 1 @multiplier = MultiPlierValue FROM @PaymentFrequencyTable WHERE PaymentFrequency = @PaymentFrequency

	SELECT  
	@CommissionPercentage =  convert(FLOAT, p.CommissionPercentage),
	@AdminPercentage = 22.5,
	@PaymentFrequency =  convert(INT, @multiplier)
	FROM policy.policy p
	join common.PaymentFrequency f ON p.PaymentFrequencyId = f.Id
	WHERE p.PolicyId = @PolicyId

	SELECT DISTINCT TOP 1
		[broker].Id AS 'BrokerId',
		[broker].[Name] AS 'Brokerage',
		rep.id AS 'RepresentativeId',
		concat(rep.FirstName, ' ', rep.SurnameOrCompanyName) AS 'Representative',
		concat(person.FirstName,' ',person.surname) AS 'MainMemberName',
		person.IdNumber AS 'MainMemberIdNo',
		CAST(person.DateOfBirth AS datetimeoffset) AS 'MainMemberDOB',
		pol.PolicyNumber AS 'PolicyNumber',
		Getdate() AS 'ApplicationDate',
		pol.PolicyInceptionDate AS 'InceptionDate',
		pol.PolicyInceptionDate AS 'PolicyDate',
		dateadd(year, 1, pol.PolicyInceptionDate) AS 'RenewalDate',
		benefit.[Name] AS 'PlanSelected',
		(SELECT TOP 1 BenefitAmount FROM product.BenefitRate ORDER BY EffectiveDate desc) AS 'BenefitSelected', 
		(SELECT TOP 1 BenefitAmount FROM product.BenefitRate ORDER BY EffectiveDate desc) AS 'MainMemberBenefitAmount',
		benefitRate.BaseRate * @multiplier AS 'BasePremium',
		(benefitRate.[BaseRate] / (1 - pol.CommissionPercentage)) * @multiplier AS 'OfficePremium',
		((benefitRate.[BaseRate] / (1 - pol.CommissionPercentage)) - benefitRate.[BaseRate]) * @multiplier AS 'Commission',
		((benefitRate.[BaseRate] / (1 - pol.CommissionPercentage)) * pol.AdminPercentage) * @multiplier AS 'AdminFee',
		round(((benefitRate.[BaseRate]) + ((benefitRate.[BaseRate] / (1 - pol.CommissionPercentage)) - benefitRate.[BaseRate]) + ((benefitRate.[BaseRate] / (1 - pol.CommissionPercentage)) * pol.AdminPercentage))  * @multiplier, 0) AS 'StartingPremium'

		FROM [policy].[policy] pol
		    left join [policy].[PolicyBenefit] (NOLOCK) polBenefit ON pol.PolicyId = polBenefit.PolicyId
			left join [product].[Benefit] (NOLOCK) benefit ON polBenefit.BenifitId = benefit.Id 
			left join [product].[BenefitRate] (NOLOCK) benefitRate ON polBenefit.BenifitId = benefitRate.BenefitId 
			inner join [policy].[policyBroker] (NOLOCK) pb ON pb.PolicyId = pol.PolicyId
			inner join [client].[Person] (NOLOCK) person ON pol.PolicyOwnerId = person.RolePlayerId
			inner join [broker].[Brokerage] (NOLOCK) [broker] ON pb.BrokerageId = [broker].Id
			inner join [broker].[Representative] (NOLOCK) rep ON rep.Id = pb.RepId
		WHERE pol.PolicyId = @PolicyId
END
GO