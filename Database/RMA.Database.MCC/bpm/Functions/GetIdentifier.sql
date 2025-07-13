
CREATE   FUNCTION [bpm].[GetIdentifier] (@wizardId int) RETURNS uniqueidentifier
AS BEGIN
	declare @fi uniqueidentifier
	select @fi = json_value([Data], '$[0].fileIdentifier') from [bpm].[Wizard] where [Id] = @wizardId
	return @fi
END