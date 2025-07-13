
CREATE procedure [policy].[RMANotificationsReport]

	@StartDate datetime,
	@EndDate datetime,
	@PolicyNumber nvarchar(40)  = null

	as

	if @PolicyNumber is null
		set @PolicyNumber = '%'

	if len(@PolicyNumber) < 10 
		set @PolicyNumber = @PolicyNumber + '%'

select N.Text, N.CreatedDate, N.CreatedBy, P.PolicyNumber, S.Name 'Status', R.DisplayName, R.emailaddress, R.CellNumber
from policy.policynote N 
join policy.policy P on P.policyid = N.PolicyId
left outer join client.roleplayer R on R.RolePlayerId = P.PolicyOwnerId
join common.policyStatus S on P.PolicyStatusId = S.Id
where p.policynumber like @PolicyNumber
and N.createdDate between @StartDate and @EndDate
and [text] like '%comm%'
order by p.PolicyNumber, n.CreatedDate