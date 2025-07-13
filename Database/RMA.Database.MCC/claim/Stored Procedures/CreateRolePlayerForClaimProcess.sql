CREATE   procedure [claim].[CreateRolePlayerForClaimProcess]
@Reference varchar(50),
@User varchar(50),
@StepData varchar(max),
@RowId INT OUTPUT
as
insert into [bpm].[wizard] values
(29, 1, 4, -1, 'Insured Life: ' + @Reference, @StepData, 1, NULL, NULL, NULL, 1, 0, @User, getdate(), @User, getdate(), getdate(), NULL)

SELECT @RowId = (SELECT SCOPE_IDENTITY())
