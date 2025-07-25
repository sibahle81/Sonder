CREATE PROCEDURE [billing].[BulkLapsePolicies]
	@idList  NVARCHAR(MAX),
	@statusId INT,
	@modifiedBy  VARCHAR(150),
	@modifiedDate DATETIME
 AS BEGIN

	declare @policy table (
		Id int identity primary key,
		PolicyId int,
		PolicyStatusId int,
		LastLapsedDate date,
		LapsedCount int
	)

	insert into @policy (PolicyId, PolicyStatusId, LastLapsedDate, LapsedCount)
		select distinct PolicyId,
			PolicyStatusId,
			LastLapsedDate,
			LapsedCount
		from policy.Policy with (nolock)
		where ParentPolicyId in (SELECT Data FROM dbo.Split(@idList, ','))
		option (maxrecursion 0)

	insert into @policy (PolicyId, PolicyStatusId, LastLapsedDate, LapsedCount)
		select distinct PolicyId,
			PolicyStatusId,
			LastLapsedDate,
			LapsedCount
		from policy.Policy with (nolock)
		where PolicyId in (SELECT Data FROM dbo.Split(@idList, ','))
		option (maxrecursion 0)

	update p set 
		PolicyStatusId = @statusId,
		ModifiedBy = @modifiedBy,
		ModifiedDate = @modifiedDate,
		LastLapsedDate = GETDATE(),
		LapsedCount = isnull(p.LapsedCount, 0) + 1
	from policy.Policy p with (nolock)
		inner join @policy t on t.PolicyId = p.PolicyId

	insert into [policy].[PolicyNote] ([PolicyId], [Text], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
	select p.[PolicyId],
		concat('Policy lapsed via procedure [billing].[BulkLapsePolicies] by ', @modifiedBy) [Text],
		0 [IsDeleted],
		@modifiedBy [CreatedBy],
		getdate() [CreatedDate],
		@modifiedBy [ModifiedBy],
		getdate() [ModifiedDate]
	from @policy p

	insert into [audit].[AuditLog] ([ItemId], [ItemType], [Action], [OldItem], [NewItem], [Date], [UserName], [CorrelationToken]) 
	select p.PolicyId [ItemId],
		'policy_Policy' [ItemType],
		'Modified' [Action],
		concat('{"PolicyStatusId": ', t.PolicyStatusId,', "LastLapsedDate": "',t.LastLapsedDate,'", "LapsedCount": ',t.LapsedCount,'}') [OldItem],
		concat('{"PolicyStatusId": ', p.PolicyStatusId,', "LastLapsedDate": "',p.LastLapsedDate,'", "LapsedCount": ',p.LapsedCount,'}') [NewItem],
		getdate() [Date],
		@modifiedBy [UserName],
		NEWID() [CorrelationToken]
	from policy.Policy p with (nolock)
		inner join @policy t on t.PolicyId = p.PolicyId

END
