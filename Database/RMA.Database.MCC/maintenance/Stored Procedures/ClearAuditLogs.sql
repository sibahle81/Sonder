CREATE PROCEDURE [maintenance].[ClearAuditLogs]
AS
BEGIN

	TRUNCATE TABLE [lead].LastViewed
	TRUNCATE TABLE [billing].LastViewed
	TRUNCATE TABLE [rules].AuditLog
	TRUNCATE TABLE [rules].LastViewed
	TRUNCATE TABLE [campaign].AuditLog
	TRUNCATE TABLE [payment].AuditLog
	TRUNCATE TABLE [campaign].LastViewed
	TRUNCATE TABLE [payment].LastViewed
	TRUNCATE TABLE [case].AuditLog
	TRUNCATE TABLE [client].AuditLog
	TRUNCATE TABLE [policy].AuditLog
	TRUNCATE TABLE [bpm].AuditLog
	TRUNCATE TABLE [case].LastViewed
	TRUNCATE TABLE [bpm].LastViewed
	TRUNCATE TABLE [claim].AuditLog
	TRUNCATE TABLE [policy].LastViewed
	TRUNCATE TABLE [client].LastViewed
	TRUNCATE TABLE [security].AuditLog
	TRUNCATE TABLE [security].LastViewed
	TRUNCATE TABLE [claim].LastViewed
	TRUNCATE TABLE [product].AuditLog
	TRUNCATE TABLE [billing].AuditLog
	TRUNCATE TABLE [lead].AuditLog
	TRUNCATE TABLE [cost].AuditLog
	TRUNCATE TABLE [cost].LastViewed
	TRUNCATE TABLE [product].LastViewed

END
