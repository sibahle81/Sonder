CREATE PROCEDURE [lead].[LeadAgeAnalysisReport_V2]
	@StartDate DATE, 
	@EndDate DATE,
	@ClientTypeId INT = NULL,
	@IndustryClassId INT = NULL,
	@Status VARCHAR(50) = NULL
AS

SELECT
[LEAD].Code AS [Lead Code],
[LEAD].DisplayName AS [Lead Name],
[CLIENTTYPE].[Name] AS [Client Type],
[COMPANY].RegistrationNumber AS [Registration Number],
[INDUSTRYCLASS].[Name] AS [Industry Class],
[AUDIT].[Status],
CASE WHEN [AUDIT].EffictiveTo IS NULL THEN 'Current' ELSE 'History' END AS [Status Type],
[AUDIT].EffectiveFrom AS [Effective From],
[AUDIT].EffictiveTo AS [Effective To],

CAST(DATEDIFF(day, [AUDIT].EffectiveFrom, COALESCE([AUDIT].EffictiveTo, GETDATE())) AS VARCHAR) + ' days ' +
CAST(DATEDIFF(hour, [AUDIT].EffectiveFrom, COALESCE([AUDIT].EffictiveTo, GETDATE())) % 24 AS VARCHAR) + ' hrs ' +
CAST(DATEDIFF(minute, [AUDIT].EffectiveFrom, COALESCE([AUDIT].EffictiveTo, GETDATE())) % 60 AS VARCHAR) + ' min' AS Duration,

CASE WHEN [CONFIG].NumberOfDaysRedSLA IS NOT NULL THEN CAST([CONFIG].NumberOfDaysRedSLA AS VARCHAR) + ' days' ELSE 'None' END AS [SLA],
CASE WHEN [AUDIT].EffictiveTo IS NULL THEN 'Yes' ELSE 'No' END AS [SLA Active],
CASE WHEN (DATEDIFF(day, [AUDIT].EffectiveFrom, COALESCE([AUDIT].EffictiveTo, GETDATE())) >= [CONFIG].NumberOfDaysRedSLA) THEN 'Yes' ELSE 'No' END AS [SLA Exceeded],

CAST(DATEDIFF(day, [AUDIT].EffectiveFrom, COALESCE([AUDIT].EffictiveTo, GETDATE())) - [CONFIG].NumberOfDaysRedSLA AS VARCHAR) + ' Days ' +
CAST(DATEDIFF(hour, [AUDIT].EffectiveFrom, COALESCE([AUDIT].EffictiveTo, GETDATE())) % 24 AS VARCHAR) + ' hours ' +
CAST(DATEDIFF(minute, [AUDIT].EffectiveFrom, COALESCE([AUDIT].EffictiveTo, GETDATE())) % 60 AS VARCHAR) + ' mins' AS [SLA Exceeded By],

[AUDIT].CreatedBy,
[AUDIT].ModifiedBy

FROM common.SLAStatusChangeAudit [AUDIT]
INNER JOIN common.SLAItemTypeConfiguration [CONFIG] ON [CONFIG].SLAItemTypeId = [AUDIT].SLAItemTypeId
INNER JOIN common.SLAItemType [TYPE] ON [TYPE].Id = [AUDIT].SLAItemTypeId
INNER JOIN [lead].[Lead] [LEAD] ON [LEAD].LeadId = [AUDIT].ItemId
INNER JOIN [lead].[Company] [COMPANY] ON [COMPANY].LeadId = [LEAD].LeadId
INNER JOIN [common].ClientType [CLIENTTYPE] ON [CLIENTTYPE].Id = [LEAD].ClientTypeId
INNER JOIN [common].IndustryClass [INDUSTRYCLASS] ON [INDUSTRYCLASS].Id = [COMPANY].IndustryClassId
WHERE  
[AUDIT].SLAItemTypeId = 1 AND --  Lead
([AUDIT].CreatedDate >= @StartDate AND [AUDIT].CreatedDate <= @EndDate) AND
([LEAD].ClientTypeId = @ClientTypeId OR @ClientTypeId IS NULL) AND
([COMPANY].IndustryClassId = @IndustryClassId OR @IndustryClassId IS NULL) AND
([AUDIT].[Status] = @Status OR @Status IS NULL)