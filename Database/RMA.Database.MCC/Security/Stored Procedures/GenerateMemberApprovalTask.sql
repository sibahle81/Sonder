Create    procedure [security].[GenerateMemberApprovalTask]
@Data varchar(MAX)
as begin
	insert into [bpm].[wizard] values
	(60, 1, 4, -1, 'Approve Member Portal User', @Data, 1, NULL, NULL, NULL, 1, 0, 'system', getdate(), 'system', getdate(), getdate(), NULL)
end