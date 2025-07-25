ALTER   PROCEDURE [policy].[CancellationLetterReportHeading]

@wizardId int,
@policyId int

as

if @wizardId = 0
begin
set @wizardId = isnull((select top 1 id from bpm.wizard where linkeditemid = @policyid and wizardConfigurationId in (26,53) order by 1 desc),0)
end

declare @wizardType int
declare @cancellationType varchar(2)

declare @data varchar(max)
select @data = [data] from bpm.wizard where id = @wizardId

select @wizardType = wizardConfigurationId from bpm.Wizard where id = @wizardId
if @wizardType = 53 --group cancel
begin 
	select @cancellationType = 'P' --by default just assume its a partial cancel until we check if its the whole group
	select @cancellationType = 'G' from policy.policy where policyId = @policyId and ParentPolicyId is null and PolicyStatusId in (10,19)	  

	select top 1 upper(c.Name) MainMemberName 
    ,P.PolicyNumber 
	,AddressLine1
	,AddressLine2
	,City
	,Province
	,PostalCode
	,dateadd(day, 1, ISNULL(X.CancellationDate,  LEFT( JSON_VALUE(@data, '$[0].mainMember.policies[0].cancellationDate'),10))) CancellationDate
	,@cancellationType CancellationType
	,ISNULL(JSON_VALUE(@data, '$[0].mainMember.emailAddress'),'NOT CONFIGURED') emailAddress
	,upper(c.Name) textArea1
	,CASE @cancellationType
		when 'G' then 'all policies insured under this scheme are cancelled and' 
		when 'P' then 'all policies listed below are cancelled and'
	end textArea2
	from policy.policy P left join client.Company C on P.PolicyOwnerId = C.RolePlayerId
	left join Client.RolePlayerAddress A on A.RolePlayerId = C.RolePlayerId and A.AddressTypeId = 2
	left join policy.policy X on X.parentpolicyId = @policyId and (X.PolicyStatusId in (10,19))
	where P.PolicyId = @policyId 
	order by A.EffectiveDate desc 
end
else if @wizardType = 26  or @wizardId = 0
begin
	set @cancellationType = 'I'
	
	select top 1  DisplayName  MainMemberName
	,P.PolicyNumber 
	,AddressLine1
	,AddressLine2
	,City
	,Province
	,PostalCode
	,dateadd(day, 1, ISNULL(CancellationDate,  LEFT( JSON_VALUE(@data, '$[0].mainMember.policies[0].cancellationDate'),10))) CancellationDate
 	,@cancellationType CancellationType
	,R.EmailAddress
	,'your RMA policy ' + P.PolicyNumber textArea1
	, 'you' textArea2
	from policy.policy P 
	left join client.RolePlayer R on P.PolicyOwnerId = R.RolePlayerId
	left join Client.RolePlayerAddress A on A.RolePlayerId = R.RolePlayerId and A.AddressTypeId = 2
	where P.PolicyId = @policyId 
	order by A.EffectiveDate desc
	 
end
