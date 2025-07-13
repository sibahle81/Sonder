
CREATE PROCEDURE [policy].[CancellationLetterReportContact]

@wizardId int,
@policyId int

as

if @wizardId = 0
begin
set @wizardId = (select top 1 id from bpm.wizard where linkeditemid = @policyid and wizardConfigurationId in (26,53) order by 1 desc)
end

declare @wizardType int
declare @cancellationType varchar(2)
select @wizardType = wizardConfigurationId from bpm.Wizard where id = @wizardId

if @wizardType = 53 --group cancel
begin 
	select @cancellationType = 'P' --by default just assume its a partial cancel until we check if its the whole group
	select @cancellationType = 'G' from policy.policy where policyId = @policyId and ParentPolicyId is null and PolicyStatusId in (10,19)	  

	select UPPER(C.FirstName) + ' ' + UPPER(C.Surname) DisplayName, C.IdNumber, P.PolicyNumber, @cancellationType CancellationType
	from policy.policy P left join client.Person C on P.PolicyOwnerId = C.RolePlayerId
	where (P.ParentPolicyId = @policyId or P.PolicyId = @policyId)
	and P.PolicyStatusId in (10,19)
end
else if @wizardType = 26 -- individual cancel
begin    
	set @cancellationType = 'I'
	select C.FirstName + ' ' + C.Surname DisplayName, C.IdNumber, P.PolicyNumber, @cancellationType CancellationType 
	from policy.policy P left join client.Person C on P.PolicyOwnerId = C.RolePlayerId
	where P.policyId = @policyId
end