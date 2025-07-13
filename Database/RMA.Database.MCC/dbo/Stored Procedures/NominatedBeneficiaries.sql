
Create   PROCEDURE [dbo].[NominatedBeneficiaries]
	@PolicyId int
as
begin
        Select distinct
		  [NominatedBeneficiaryName] = p.FirstName+' '+ p.Surname ,
          [NominatedBeneficiaryIdNo] = p.IdNumber,
          [NominatedBeneficiaryDOB] =convert(datetime,SWITCHOFFSET(convert(datetimeoffset,p.DateOfBirth),'+02:00'))

		from policy.policy pol
		    inner join client.RolePlayerRelation rp on rp.PolicyId = pol.PolicyId
			inner join client.person p on p.RolePlayerId = rp.FromRolePlayerId
						
		where pol.PolicyId = @PolicyId and rp.RolePlayerTypeId = 41
end