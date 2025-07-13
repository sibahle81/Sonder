
CREATE PROCEDURE [policy].[ChildOverAgeLetter]

	@policyId int,
	@rolePlayerId int

as
	-- jpk for testing
	--declare @policyid int
	--declare @roleplayerid int
	--set @policyid = 186546
	--set @roleplayerid = 586627      
	 
	select P.PolicyNumber, Parent.DisplayName ParentName, Child.DisplayName ChildName, Parent.PreferredCommunicationTypeId, Parent.CellNumber, Parent.EmailAddress, 
	EOMONTH(dateadd(year, year(getdate()) - year(DateOfBirth)+1, DateOfBirth)) CoverExpireDate
	from policy.policy P 
	left join client.RolePlayer Parent on P.PolicyOwnerId = Parent.RolePlayerId
	left join client.RolePlayer Child on @rolePlayerId = Child.RolePlayerId
	left join client.Person ChildPerson on @rolePlayerId = ChildPerson.RolePlayerId
	where P.policyId = @policyId