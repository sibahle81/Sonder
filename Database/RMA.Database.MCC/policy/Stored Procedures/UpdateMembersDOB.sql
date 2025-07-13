CREATE PROCEDURE [policy].[UpdateMembersDOB]
as begin

update per set per.DateOfBirth = t.DateOfBirth
from client.Person per
	inner join (
		select RolePlayerId,
		convert(date, concat(year(DateOfBirth), '-', SUBSTRING(IdNumber, 3, 2), '-', SUBSTRING(IdNumber, 5, 2))) [DateOfBirth]
		from client.Person
		where IdTypeId = 1
		and len(IdNumber) = 13
		and isdate(concat(year(DateOfBirth), '-', SUBSTRING(IdNumber, 3, 2), '-', SUBSTRING(IdNumber, 5, 2))) = 1
	) t on t.RolePlayerId = per.RolePlayerId
where per.DateOfBirth <> t.DateOfBirth

end
