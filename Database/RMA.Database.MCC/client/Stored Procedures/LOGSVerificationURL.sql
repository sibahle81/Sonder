CREATE PROCEDURE [client].[LOGSVerificationURL]
	AS
BEGIN
	SELECT
	[Settings].[Value] AS [LOGSVerificationURL]
	FROM [common].Settings [Settings]
	WHERE [Settings].[Key] = 'ValidateLogsUrl'
END