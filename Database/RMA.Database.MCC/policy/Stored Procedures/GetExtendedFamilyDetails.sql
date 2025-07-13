

CREATE   PROCEDURE [policy].[GetExtendedFamilyDetails]
	@PolicyId INT
AS
BEGIN
	Select distinct
		  [ExtendedName] = p.FirstName+' '+ p.Surname ,
          [ExtendedIdNo] = p.IdNumber,
          [ExtendedDOB] =  convert(datetime,SWITCHOFFSET(convert(datetimeoffset,p.DateOfBirth),'+02:00')),
          [ExtendedBenefitAmount] = benefitRate.BenefitAmount,
          [ExtendedPremium] = (select top 1 BaseRate from product.BenefitRate order by 1 desc),
          [JoiningDate] = pol.PolicyInceptionDate

		from policy.policy pol
		
		    inner join client.RolePlayerRelation (NOLOCK) rp on rp.PolicyId = pol.PolicyId
			inner join client.person (NOLOCK) p on p.RolePlayerId = rp.FromRolePlayerId
			left join policy.PolicyBenefit (NOLOCK) polBenefit on polBenefit.PolicyId = pol.PolicyId
			left join product.BenefitRate (NOLOCK) benefitRate on polBenefit.BenifitId = benefitRate.BenefitId
						
		where pol.PolicyId = @PolicyId AND rp.RolePlayerTypeId = 38
END