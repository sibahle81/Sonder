

CREATE   PROCEDURE [policy].[CheckAnnualIncreaseQlinkUpdateStatus] @userId varchar(128)
AS BEGIN

	set nocount on

	if isnull(@userId, '') = '' begin
		set @userId = 'BackendProcess'
	end

	update q set
		StatusCode = 200
	from client.QlinkTransaction q
		inner join policy.AnnualIncrease ai on ai.PolicyId = q.ItemId and q.ItemType = 'Policy'
	where q.StatusCode = 400
	  and json_value([Response], '$.Message') = 'QLink Error: Exact duplicate transaction'

	update ai set
		ai.PolicyIncreaseStatusId = case t.StatusCode when 200 then 4 else 7 end,
		ai.IncreaseFailedReason = case t.StatusCode when 200 then null else t.StatusMessage end,
		ai.ModifiedBy = @userId,
		ai.ModifiedDate = getdate()
	from policy.AnnualIncrease ai
		inner join (
			select PolicyId,
				EffectiveDate,
				StatusCode,
				ErrorCode,
				StatusMessage
			from (
				select ai.PolicyId,
					ai.EffectiveDate,
					q.StatusCode,
					json_value(q.[Response], '$.ErrorCode') [ErrorCode],
					json_value(q.[Response], '$.Message') [StatusMessage],
					Rank() over (partition by q.ItemId order by q.CreatedDate desc) [Rank]
				from policy.AnnualIncrease ai
					inner join client.QlinkTransaction q on q.ItemType = 'Policy' and q.ItemId = ai.PolicyId and q.QlinkTransactionTypeId = 2
				where ai.PolicyIncreaseStatusId = 3
			) t
			where t.[Rank] = 1
		) t on t.PolicyId = ai.PolicyId and t.EffectiveDate = t.EffectiveDate

	select count(*) [Count] from policy.AnnualIncrease where PolicyIncreaseStatusId = 4

	set nocount off

END