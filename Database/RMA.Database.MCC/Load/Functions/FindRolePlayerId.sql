CREATE FUNCTION [Load].[FindRolePlayerId] (@policyId int, @firstName varchar(64), @surname varchar(64), @idNumber varchar(32), @dateOfBirth date, @rolePlayerTypeId int)
RETURNS int 
AS BEGIN

	declare @rolePlayerId int = null

	-- If a valid ID or passport number is supplied, try to match on that only, and if
	-- the @idNumber is a valid ID number return 0 so that a new RolePlayer  is created
	if (patindex('%[^a-zA-Z0-9]%', @idNumber) = 0) begin
		select @rolePlayerId = RolePlayerId from client.Person (nolock) where IdNumber = @idNumber
		if (isnull(@rolePlayerId, 0) > 0) return @rolePlayerId
	end

	-- If there is an exact match on all the details, return that person
	select @rolePlayerId = RolePlayerId
	from client.Person (nolock)
	where IdNumber = @idNumber
	  and DateOfBirth = @dateOfBirth
	  and FirstName = @firstName
	  and Surname = @surname

	if (isnull(@rolePlayerId, 0) > 0) return @rolePlayerId
	
	declare @person table (
		RolePlayerId int primary key,
		FirstName varchar(64),
		Surname varchar(64),
		IdTypeId int,
		DateOfBirth date
	)

	-- Try to match with existing members already on the policy
	if (isnull(@policyId, 0) > 0) begin
		insert into @person
			select per.RolePlayerId,
				trim(replace(per.FirstName, char(9), ' ')) [FirstName],
				trim(replace(per.Surname, char(9), ' ')) [Surname],
				per.IdTypeId,
				per.DateOfBirth
			from policy.PolicyInsuredLives pil (nolock)
				inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
			where pil.PolicyId = @policyId
			  -- Exclude members with proper id numbers, those 
			  -- are identifier on the id number only
			  and isnumeric(per.IdNumber) = 0
			  and len(per.IdNumber) <> 13

		-- Replace JSON character, because it messes with the algorithm
		update @person set FirstName = replace(FirstName, '"', '')
		update @person set Surname = replace(Surname, '"', '')

		-- Match on the exact dob and surname, but allow similar first names
		select top 1 @rolePlayerId = per.RolePlayerId
		from @person per
		where client.NamesAreSimilar(per.FirstName, @firstName, 2) = 1
			and replace(per.Surname, ' ', '') = replace(@surname, ' ', '')
			and per.DateOfBirth = @dateOfBirth
		order by per.IdTypeId, 
			per.RolePlayerId desc

		if (isnull(@rolePlayerId, 0) = 0) begin
			-- Match on the exact dob, but allow similar first names and surnames
			select top 1 @rolePlayerId = per.RolePlayerId
			from @person per
			where client.NamesAreSimilar(per.FirstName, @firstName, 2) = 1
				and client.NamesAreSimilar(per.Surname, @surname, 2) = 1
				and per.DateOfBirth = @dateOfBirth
			order by per.IdTypeId,
				per.RolePlayerId desc
		end

		if (isnull(@rolePlayerId, 0) = 0) begin
			-- Match on same first name and surname, but allow some leeway on the year of the dob
			select top 1 @rolePlayerId = per.RolePlayerId
			from @person per
			where client.NamesAreSimilar(per.FirstName, @firstName, 1) = 1
				and client.NamesAreSimilar(per.Surname, @surname, 1) = 1
					and day(per.DateOfBirth) = day(@dateOfBirth)
					and month(per.DateOfBirth) = month(@dateOfBirth)
					and abs(datediff(year, per.DateOfBirth, @dateOfBirth)) <= 1
			order by per.IdTypeId,
				per.RolePlayerId desc
		end

	end else begin

		insert into @person
			select per.RolePlayerId,
				trim(replace(per.FirstName, char(9), ' ')) [FirstName],
				trim(replace(per.Surname, char(9), ' ')) [Surname],
				per.IdTypeId,
				per.DateOfBirth
			from client.Person per (nolock)
			where per.DateOfBirth = @dateOfBirth
			  and replace(per.Surname, ' ', '') = replace(@surname, ' ', '')
			  -- Exclude members with proper id numbers, those 
			  -- are identified on the id number only
			  and isnumeric(per.IdNumber) = 0
			  and len(per.IdNumber) <> 13

		declare @count int
		select @count = count(*) from @person

		if isnull(@count, 0) > 0 begin
			-- Replace JSON character, because it messes with the algorithm
			update @person set FirstName = replace(FirstName, '"', '')
			update @person set Surname = replace(Surname, '"', '')
		
			-- Criteria are more strenuous if we don't have the policy number
			-- Match on the exact dob and surname, but allow similar first names
			select top 1 @rolePlayerId = x.RolePlayerId
			from @person x
			where client.NamesAreSimilar(x.FirstName, @firstName, 2) = 1
			order by x.IdTypeId,
				x.RolePlayerId desc
		end
	end

	return isnull(@rolePlayerId, 0)

END