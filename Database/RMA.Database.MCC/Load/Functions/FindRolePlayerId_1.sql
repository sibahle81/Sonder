
CREATE   FUNCTION [Load].[FindRolePlayerId] (@policyId int, @firstName varchar(64), @surname varchar(64), @idNumber varchar(32), @dateOfBirth date)
RETURNS int AS
BEGIN

	declare @rolePlayerId int = null

	-- If a 13 digit ID number is supplied, try to match on that only
	if (len(@idNumber) = 13 and isnumeric(@idNumber) = 1) begin
		select @rolePlayerId = RolePlayerId from client.Person where IdNumber = @idNumber
	end

	-- If the roleplayer could not be matched on the ID number, try the name and date of birth
	if (@rolePlayerId is null and @policyId is not null) begin
		-- Try to match on the name and dob, on the same policy
		select top 1 @rolePlayerId = per.RolePlayerId
		from policy.PolicyInsuredLives pil
			inner join client.Person per on per.RolePlayerId = pil.RolePlayerId
		where pil.PolicyId = @policyId
			and replace(per.FirstName, ' ', '') = replace(@firstName, ' ', '')
			and replace(per.Surname, ' ', '') = replace(@surname, ' ', '')
			and per.DateOfBirth = @dateOfBirth
		order by per.IdTypeId, per.RolePlayerId desc
		-- If the member could not be found, try a partial match on the first name (surname must still match)
		if (@rolePlayerId is null) begin
			select top 1 @rolePlayerId = per.RolePlayerId
			from policy.PolicyInsuredLives pil
				inner join client.Person per on per.RolePlayerId = pil.RolePlayerId
			where pil.PolicyId = @policyId
				and replace(per.Surname, ' ', '') = replace(@surname, ' ', '')
				and per.DateOfBirth = @dateOfBirth
				and difference(per.FirstName, @firstName) > 2
			order by per.IdTypeId, per.RolePlayerId desc
		end
	end

	return isnull(@rolePlayerId, 0)

END