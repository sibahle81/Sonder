
CREATE PROCEDURE [policy].[CheckUpcomingOverAge]

	@Days int

	as

	SELECT P.PolicyId, C.RolePlayerId --, P.PolicyNumber, datediff(year,dateofbirth,getdate()) Age, DATEADD(year,datediff(year,dateofbirth,getdate())+1,dateofbirth) NextBirthday, DATEDIFF(day, getdate(), DATEADD(year,datediff(year,dateofbirth,getdate())+1,dateofbirth)) DaysToBirthDay 
	from client.RolePlayerRelation R
	left join policy.policy P on R.PolicyId = P.PolicyId
	left join client.Person C on R.FromRolePlayerId = C.RolePlayerId
	where R.RolePlayerTypeId = 32
	and P.PolicyStatusId = 1
	and C.IsAlive = 1
	and C.IsStudying = 0
	and C.IsDisabled = 0
	and datediff(year,dateofbirth,getdate()) = 20
	and DATEDIFF(day, getdate(), DATEADD(year,datediff(year,dateofbirth,getdate()),dateofbirth)) = @Days