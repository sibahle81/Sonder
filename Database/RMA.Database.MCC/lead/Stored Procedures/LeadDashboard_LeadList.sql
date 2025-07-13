CREATE PROCEDURE [lead].[LeadDashboard_LeadList]
@StatusID INT
AS
BEGIN
	SELECT *
    FROM [lead].[Lead]
	WHERE [lead].[Lead].LeadClientStatusId = @StatusID
END