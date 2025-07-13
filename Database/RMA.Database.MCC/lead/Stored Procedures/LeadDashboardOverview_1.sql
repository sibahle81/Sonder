CREATE PROCEDURE [lead].[LeadDashboardOverview]
AS
BEGIN
	SELECT [common].[LeadClientStatus].Name AS LeadStatus, COUNT([lead].[Lead].LeadId) AS NumberOfLeads 
    FROM [lead].[Lead] INNER JOIN 
		 [common].[LeadClientStatus] ON [common].[LeadClientStatus].Id = [lead].[Lead].LeadClientStatusId
    GROUP BY [common].[LeadClientStatus].Name
END