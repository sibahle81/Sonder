

CREATE   PROCEDURE [policy].[GetChildrenDetails]
	@PolicyId INT
AS
BEGIN
	select Distinct
		  [ChildName] = p.FirstName+' '+ p.Surname ,
          [ChildIdNo] = p.IdNumber,
          [ChildDOB] = convert(datetime,SWITCHOFFSET(convert(datetimeoffset,p.DateOfBirth),'+02:00')),
          [ChildBenefitAmount] = benefitRate.BenefitAmount,
          [JoiningDate] = pol.PolicyInceptionDate

		from policy.policy pol
		    inner join client.RolePlayerRelation (NOLOCK) rp on rp.PolicyId = pol.PolicyId
			left join policy.PolicyBenefit (NOLOCK) polBenefit on pol.PolicyId = polBenefit.PolicyId
			left join product.Benefit (NOLOCK) benefit on polBenefit.BenifitId = benefit.Id 
			left join product.BenefitRate (NOLOCK) benefitRate on polBenefit.BenifitId = benefitRate.BenefitId
			inner join client.person (NOLOCK) p on p.RolePlayerId = pol.PolicyOwnerId
					
		where pol.PolicyId = @PolicyId AND rp.RolePlayerTypeId = 32
END