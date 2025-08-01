CREATE PROCEDURE [policy].[CheckAnnualIncreaseQlinkUpdateStatus] @userId varchar(128)
AS BEGIN

	set nocount on

	if isnull(@userId, '') = '' set @userId = 'BackendProcess'

	update ai set
		ai.PolicyIncreaseStatusId = case x.StatusCode when 200 then 4 else 7 end,
		ai.IncreaseFailedReason = case x.StatusCode when 200 then null else x.StatusMessage end,
		ai.ModifiedBy = @userId,
		ai.ModifiedDate = getdate()
	from policy.AnnualIncrease ai (nolock)
		inner join (
			select ai.AnnualIncreaseId,
				ai.PolicyId,
				ai.EffectiveDate,
				q.StatusCode,
				json_value(q.[Response], '$.ErrorCode') [ErrorCode],
				json_value(q.[Response], '$.Message') [StatusMessage],
				-- The last QUPD created after the increase was calculated ...
				Rank() over (partition by q.ItemId order by q.CreatedDate desc) [Rank]
			from policy.AnnualIncrease ai (nolock)
				inner join client.QlinkTransaction q (nolock)
					 on q.ItemType = 'Policy'
					and q.ItemId = ai.PolicyId
					and q.QlinkTransactionTypeId = 2
					and q.IsDeleted = 0
					and ai.IsDeleted = 0
					and q.CreatedDate >= ai.CreatedDate
					-- ... where the QUPD amount is the same as the new calculated premium
					and json_value(q.Request, '$.Amount') = ai.PremiumAfter
					-- Ignore duplicate transactions
					and json_value(q.Response, '$.Message') not like '%duplicate transaction%'
			where ai.PolicyIncreaseStatusId = 3 -- QLink Request Sent
			  and ai.IsDeleted = 0
		) x on x.AnnualIncreaseId = ai.AnnualIncreaseId
	where x.[Rank] = 1

	select count(*) [Count] from policy.AnnualIncrease where PolicyIncreaseStatusId = 4 -- QLink Request Successful

	set nocount off

END
GO
