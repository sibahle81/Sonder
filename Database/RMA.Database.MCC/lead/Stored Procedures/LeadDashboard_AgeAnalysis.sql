CREATE PROCEDURE [lead].[LeadDashboard_AgeAnalysis]
AS
BEGIN
	declare @LeadsAgeAnalysis table (LeadStatus nvarchar(50), NumberOfLeads int)
	insert into @LeadsAgeAnalysis SELECT '0 To 30 Days', SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 0 AND 30  THEN 1 ELSE 0 END) FROM [lead].[Lead]
	insert into @LeadsAgeAnalysis SELECT '30 To 60 Days', SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 31 AND 60 THEN 1 ELSE 0 END) FROM [lead].[Lead]
	insert into @LeadsAgeAnalysis SELECT 'Over 60 Days', SUM(CASE WHEN DATEDIFF(DAY,[CreatedDate],GETDATE()) BETWEEN 61 AND 120 THEN 1 ELSE 0 END) FROM [lead].[Lead]
	select * from @LeadsAgeAnalysis
	
END