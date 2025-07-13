CREATE PROCEDURE [quote].[SLAStatusChangeAuditAnalysis]
	@StartDate DATE, 
	@EndDate DATE,
	@Status VARCHAR(50) = NULL,
	@ItemId INT = NULL
AS

SELECT
	[QUOTE].QuotationNumber AS [Quote Number],
	[AUDIT].[Status],
	CASE WHEN (SELECT TOP 1 [AD].SLAStatusChangeAuditId FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC) = [AUDIT].SLAStatusChangeAuditId THEN 'Current' ELSE 'History' END AS [Status Type],
	[AUDIT].EffectiveFrom AS [Effective From],
	[AUDIT].EffictiveTo AS [Effective To],

	CAST(DATEDIFF(day, ([AUDIT].EffectiveFrom), COALESCE(([AUDIT].EffictiveTo), GETDATE())) AS VARCHAR) + ' days ' +
	CAST(DATEDIFF(hour, ([AUDIT].EffectiveFrom), COALESCE(([AUDIT].EffictiveTo), GETDATE())) % 24 AS VARCHAR) + ' hrs ' +
	CAST(DATEDIFF(minute, ([AUDIT].EffectiveFrom), COALESCE(([AUDIT].EffictiveTo), GETDATE())) % 60 AS VARCHAR) + ' min' AS Duration,

	CAST(DATEDIFF(day, (SELECT TOP 1 [AD].EffectiveFrom FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId), COALESCE((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC), GETDATE())) AS VARCHAR) + ' days ' +
	CAST(DATEDIFF(hour, (SELECT TOP 1 [AD].EffectiveFrom FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId), COALESCE((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC), GETDATE())) % 24 AS VARCHAR) + ' hrs ' +
	CAST(DATEDIFF(minute, (SELECT TOP 1 [AD].EffectiveFrom FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId), COALESCE((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC), GETDATE())) % 60 AS VARCHAR) + ' min' AS [Overall Duration],

	CASE WHEN [CONFIG].NumberOfDaysRedSLA IS NOT NULL THEN CAST([CONFIG].NumberOfDaysRedSLA AS VARCHAR) + ' days' ELSE ' none' END AS [SLA],

	CASE WHEN ((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC) IS NULL) THEN 'Yes' ELSE 'No' END AS [SLA Active],

	CASE WHEN (DATEDIFF(day, (SELECT TOP 1 [AD].EffectiveFrom FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId), COALESCE((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC), GETDATE())) >= [CONFIG].NumberOfDaysRedSLA) THEN 'Yes' ELSE 'No' END AS [SLA Exceeded],

	CASE WHEN (DATEDIFF(day, (SELECT TOP 1 [AD].EffectiveFrom FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId), COALESCE((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC), GETDATE())) >= [CONFIG].NumberOfDaysRedSLA) THEN
	(CAST(DATEDIFF(day, (SELECT TOP 1 [AD].EffectiveFrom FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId), COALESCE((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC), GETDATE())) - [CONFIG].NumberOfDaysRedSLA AS VARCHAR) + ' days ' +
	CAST(DATEDIFF(hour, (SELECT TOP 1 [AD].EffectiveFrom FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId), COALESCE((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC), GETDATE())) % 24 AS VARCHAR) + ' hrs ' +
	CAST(DATEDIFF(minute, (SELECT TOP 1 [AD].EffectiveFrom FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId), COALESCE((SELECT TOP 1 [AD].EffictiveTo FROM common.SLAStatusChangeAudit [AD] WHERE [AD].ItemId = [AUDIT].ItemId ORDER BY [AD].SLAStatusChangeAuditId DESC), GETDATE())) % 60 AS VARCHAR) + ' mins') ELSE 'Not Exceeded' END AS [SLA Exceeded By],

	[AUDIT].CreatedBy,
	[AUDIT].ModifiedBy

FROM common.SLAStatusChangeAudit [AUDIT]
	INNER JOIN common.SLAItemTypeConfiguration [CONFIG] ON [CONFIG].SLAItemTypeId = [AUDIT].SLAItemTypeId
	INNER JOIN common.SLAItemType [TYPE] ON [TYPE].Id = [AUDIT].SLAItemTypeId
	INNER JOIN [quote].[Quote_V2] [QUOTE] ON [QUOTE].QuoteId = [AUDIT].ItemId
WHERE 
	[AUDIT].SLAItemTypeId = 2 AND --  Quote
	([AUDIT].CreatedDate >= @StartDate AND [AUDIT].CreatedDate <= @EndDate) AND
	([AUDIT].[Status] = @Status OR @Status IS NULL) AND
	([AUDIT].[ItemId] = @ItemId OR @ItemId IS NULL)
ORDER BY [AUDIT].ItemId