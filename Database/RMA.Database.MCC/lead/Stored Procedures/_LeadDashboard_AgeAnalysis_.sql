CREATE PROCEDURE [lead].[LeadDashboard_AgeAnalysis]
AS
BEGIN
	SELECT  [common].[LeadClientStatus].[Name] AS LeadStatus,
        SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 0 AND 30  THEN 1 ELSE 0 END) AS [0_30_DAYS],
        SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 31 AND 60  THEN 1 ELSE 0 END) AS [31_60_DAYS],
        SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 61 AND 120 THEN 1 ELSE 0 END) AS [61_120_DAYS]
	FROM    [lead].[Lead] INNER JOIN
			[common].[LeadClientStatus] ON [common].[LeadClientStatus].Id =  [lead].[Lead].LeadClientStatusId
	GROUP BY [common].[LeadClientStatus].[Name]
END