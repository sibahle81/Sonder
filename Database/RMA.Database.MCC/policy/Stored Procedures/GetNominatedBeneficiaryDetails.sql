

CREATE   PROCEDURE [policy].[GetNominatedBeneficiaryDetails]
	@PolicyId INT
AS
BEGIN
        Select distinct
		  [NominatedBeneficiaryName] = p.FirstName+' '+ p.Surname ,
          [NominatedBeneficiaryIdNo] = p.IdNumber,
          [NominatedBeneficiaryDOB] =convert(datetime,SWITCHOFFSET(convert(datetimeoffset,p.DateOfBirth),'+02:00'))

		from policy.policy (NOLOCK) pol
		    inner join client.RolePlayerRelation (NOLOCK) rp on rp.PolicyId = pol.PolicyId
			inner join client.person (NOLOCK) p on p.RolePlayerId = rp.FromRolePlayerId
						
		where pol.PolicyId = @PolicyId and rp.RolePlayerTypeId = 41
END