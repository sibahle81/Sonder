CREATE PROCEDURE [policy].[GetCfpNominatedBeneficiaryDetails] @wizardId int = null, @policyId int = null
AS BEGIN
	
	declare @member table (
		NominatedBeneficiaryName varchar(128),
		NominatedBeneficiaryIdNo varchar(64),
		NominatedBeneficiaryDOB date,
		RelationShip varchar(64),
		AllocationPercentage float
	)

	if isnull(@wizardId, 0) > 0 begin

		declare @json varchar(max)
		select @json = [Data], @policyId = LinkedItemId from bpm.Wizard (nolock) where Id = @wizardId 

		insert into @member
			select distinct displayName,
				idNumber,
				dateOfBirth,
				iif(fromRolePlayer = toRolePlayer, 'Main Member', 'Beneficiary'),
				isnull(allocationPercentage, 0) / 100.0
			from openjson(@json, '$[0].beneficiaries') 
				with (
					displayName NVARCHAR(100) '$.displayName',
					idNumber NVARCHAR(50) '$.person.idNumber',
					dateOfBirth DATETIME '$.person.dateOfBirth',
					fromRolePlayer int '$.fromRolePlayers[0].fromRolePlayerId',
					toRolePlayer int '$.fromRolePlayers[0].toRolePlayerId',
					allocationPercentage INT '$.fromRolePlayers[0].allocationPercentage'
				);

	end else begin

		insert into @member
			select distinct upper(concat(per.FirstName, ' ', per.Surname)),
				iif(isnumeric(per.IdNumber) = 1, per.IdNumber, format(per.DateOfBirth, 'yyyy-MM-dd')),
				per.DateOfBirth,
				iif(rr.FromRolePlayerId = rr.ToRolePlayerId, 'Main Member', 'Beneficiary'),
				rr.AllocationPercentage / 100.0
			from client.RolePlayerRelation rr (nolock)
				inner join client.Person per (nolock) on per.RolePlayerId = rr.FromRolePlayerId
			where rr.PolicyId = @policyId
			  and rr.RolePlayerTypeId = 41
	end

	select case RelationShip when 'Main Member' then 1 else 2 end [SortOrder],
		NominatedBeneficiaryName,
		NominatedBeneficiaryIdNo,
		NominatedBeneficiaryDOB,
		RelationShip,
		AllocationPercentage
	from @member
	order by SortOrder,
		NominatedBeneficiaryName
END
