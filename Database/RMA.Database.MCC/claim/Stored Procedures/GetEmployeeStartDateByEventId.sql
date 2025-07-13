-- =================================================================
-- Author: Otshepeng Tlalang
-- Created date: 2023/03/30
-- =================================================================
CREATE PROCEDURE [Claim].[GetEmployeeStartDateByEventId]
	@eveentID AS int
AS 

SELECT 
[PE2].StartDate
FROM [claim].[PersonEvent] [PE]
INNER JOIN [client].[PersonEmployment] [PE2] on [PE].InsuredLifeId = [PE2].EmployeeRolePlayerId  
WHERE [PE].EventId = @eveentID 
ORDER BY [PE2].StartDate DESC