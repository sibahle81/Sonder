CREATE   Procedure [debt].[getActionLogs_Details]
(
@FinPayeeId int,
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)

SET @SelectCount = (select 
		Count (*)
	from 
	 [debt].[ActionLogs]
	where 
	IsDeleted = 0)

SET @RecordCount = (select 
		Count (*)
	from 
	 [debt].[ActionLogs]
	where 
	IsDeleted = 0)

	select 
		[debt].[ActionLogs].Id,			
		[debt].[ActionLogs].LogTitle,
		[debt].[ActionLogs].Description,		
		[debt].[ActionLogs].AgentId,				
		[debt].[ActionLogs].AssignDate, 
		[debt].[ActionLogs].AssignTime,
		[debt].[ActionLogs].FinPayeeId,
		[debt].[ActionLogs].ActionType,
		[debt].[ActionLogs].IsActive,		
		[debt].[ActionLogs].IsDeleted,		
		[debt].[ActionLogs].CreatedBy,	
		[debt].[ActionLogs].CreatedDate,	
		case when isnull([security].[user].UserName,'') ='' then [security].[user].DisplayName else [security].[user].UserName End  [ModifiedBy],
		[debt].[ActionLogs].ModifiedDate
		, @SelectCount 
	from 
	[debt].[ActionLogs] 
	Left join [security].[user] on [security].[user].Email  = [debt].[ActionLogs].ModifiedBy 	
	where 
		[debt].[ActionLogs].IsDeleted = 0
		and [debt].[ActionLogs].FinPayeeId = @FinPayeeId
		order by [debt].[ActionLogs].[id] desc 
END

--exec [debt].[GetActionLogs_Details] 1009565 -- Parameter  @FinPayeeId 