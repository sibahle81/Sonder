CREATE PROCEDURE [claim].[GetEventsWithNoNotificationSent]
AS 
BEGIN

SELECT DISTINCT TOP 5  e.[EventId], 
		e.[EventReferenceNumber],  
		e.[Description],
		e.[EventTypeId],
		e.[EventStatusId],
		e.AdviseMethodId,
		e.RiskAddressId,
		e.DateAdvised,
		e.EventDate,
		e.WizardId,
		e.IsDeleted,
		e.CreatedBy,
		e.CreatedDate,
		e.ModifiedBy,
		e.ModifiedDate,
		e.LocationCategoryID,
		e.NumberOfInjuredEmployees,
		e.NumberOfDeceasedEmployees,
		e.MemberSiteId
FROM Claim.PersonEvent AS PE 
	 INNER JOIN Claim.[Event] AS E ON e.EventId = PE.EventId
	WHERE E.EventTypeId IN (1,3) AND e.IsDeleted = 0 AND MONTH(e.CreatedDate) = MONTH(GETDATE()) AND PE.CompanyRolePlayerId IS NOT NULL AND PersonEventid NOT IN(
	SELECT DISTINCT PersonEventId FROM Claim.PersonEvent AS PE 
	INNER JOIN campaign.EmailAudit AS EA ON PE.personEventId = EA.ItemId 
	WHERE EA.[Subject] = 'Notification Receipt letter' OR EA.[Subject] = 'Disease Acknowledged' OR EA.[Subject] ='Disease Not Acknowledged'
	UNION
	SELECT DISTINCT PersonEventId FROM claim.personEvent AS PE 
	INNER JOIN campaign.smsAudit AS sa ON PE.personEventId = sa.ItemId 
	WHERE ([Message] LIKE 'Good day, please find your claim number %. Claim has been forwarded for a liability decision.' 
		OR [Message] LIKE 'Good day, please find your PEV number %. Please forward your first medical report to rmascannings@randmutual.co.za for your claim to be fully acknowledged.'
		OR [Message] LIKE 'Good day, please find your PEV number %. Please forward all disease related reports to  rmascannings@randmutual.co.za for your claim to be fully acknowledged.'))
ORDER BY e.[EventId] DESC

END
