

CREATE PROCEDURE [roleplayer].[GetContactDeatils]
@ClientType INT NULL,
@PeriodType INT = NULL,
@StartDate DATE = NULL,
@EndDate DATE = NULL,
@ContactType INT = NULL,
@Status BIT = NULL

AS
BEGIN

    DECLARE @PeriodDate DATE = NULL;
	DECLARE @rolePlayerIdentificationTypeId INT = NULL; 

	IF(@PeriodType IS NOT NULL AND @PeriodType <> 5)
	BEGIN
		SELECT @PeriodDate =
			CASE WHEN @PeriodType = 1 THEN DATEADD(DAY, DATEDIFF(DAY, 0, GETDATE() -0), 0)
				 WHEN @PeriodType = 2 THEN DATEADD(WEEK, DATEDIFF(WEEK, -1, GETDATE()), -1)
				 WHEN @PeriodType = 3 THEN DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) 
				 WHEN @PeriodType = 4 THEN DATEADD(YEAR, DATEDIFF(YEAR, 0, GETDATE()), 0) 
		END
	END

	IF(@ClientType IS NOT NULL AND @ClientType = 1)
	BEGIN
	       SET @RolePlayerIdentificationTypeId = 1;
	END
	IF(@ClientType IS NOT NULL AND @ClientType = 0)
	BEGIN
		SET @RolePlayerIdentificationTypeId = 2;
	END



	
SELECT FinPayee.FinPayeNumber AS MemberNo,[Title].[Name] AS ContactTitle,[Company].[Name] AS MemberName, [RolePlayer].DisplayName AS ContactName,[RolePlayer].TellNumber AS PhoneNumber,[RolePlayer].EmailAddress,
               [RolePlayerAddress].AddressLine1, [RolePlayerAddress].AddressLine2,[RolePlayerAddress].[City],[RolePlayerAddress].[PostalCode],[Company].[VatRegistrationNo],IIF([Company].[VatRegistrationNo] IS NULL,'N','Y') AS HasVAT,
			   (SELECT TOP 1 [RPC].[Firstname] + ' ' + [RPC].[Surname] 
				FROM [client].[RolePlayerContact][RPC] LEFT JOIN [client].[RolePlayer][RP] 
				ON [RPC].RolePlayerId = [RP].RolePlayerId 
				WHERE [RPC].ContactDesignationTypeId = 5 
				AND [RPC].[RolePlayerId] = [RolePlayer].[RolePlayerId]) AS AccountExecutive,
				[Company].[Name] AS Grouplevel,[Company].ReferenceNumber AS CompComm_Ref_No
FROM [client].[RolePlayer][RolePlayer]  LEFT JOIN
	 [client].[Person] [Person] ON [RolePlayer].[RolePlayerId] = [Person].[RolePlayerId] LEFT JOIN
	 [client].[FinPayee][FinPayee] ON [RolePlayer].[RolePlayerId] = [FinPayee].RolePlayerId LEFT JOIN
	 [client].[RolePlayerContact][RolePlayerContact] ON [RolePlayer].[RolePlayerId] = [RolePlayerContact].RolePlayerId LEFT JOIN
	 [client].[RolePlayerAddress][RolePlayerAddress] ON [RolePlayer].[RolePlayerId] = [RolePlayerAddress].[RolePlayerId] LEFT JOIN
	 [client].[Company][Company] ON [RolePlayer].[RolePlayerId] = [Company].RolePlayerId LEFT JOIN
	 [common].[Title][Title] ON [Title].Id = [RolePlayerContact].[TitleId] LEFT JOIN
	 [common].[CommunicationType][CommunicationType] ON [CommunicationType].Id = [RolePlayer].PreferredCommunicationTypeId LEFT JOIN
     [policy].[Policy][Policy] ON [RolePlayer].[RolePlayerId] = [Policy].PolicyOwnerId
WHERE (@rolePlayerIdentificationTypeId  IS NULL OR [RolePlayer].[RolePlayerIdentificationTypeId] = @rolePlayerIdentificationTypeId ) 
AND (@StartDate IS NULL OR [RolePlayer].[CreatedDate]   >= @StartDate  AND [RolePlayer].[CreatedDate]  <= CONVERT(datetime2, CONVERT(VARCHAR(11),@EndDate, 111 ) + ' 23:59:59', 111))
AND (@PeriodDate  IS NULL OR [RolePlayer].[CreatedDate] >= @PeriodDate ) 
AND (@ContactType = NULL OR [CommunicationType].[id] = @ContactType OR @ContactType = 5)
--AND (@Status = NULL OR @Status = (CASE WHEN @Status = 1 THEN (SELECT COUNT([Policy].PolicyId) FROM [policy].[Policy][Policy] WHERE [Policy].PolicyOwnerId = [RolePlayer].[RolePlayerId] GROUP BY [Policy].PolicyId HAVING COUNT([Policy].PolicyId) > 1 )
--                 ELSE (SELECT COUNT([Policy].PolicyId) FROM [policy].[Policy][Policy] WHERE [Policy].PolicyOwnerId = [RolePlayer].[RolePlayerId] GROUP BY [Policy].PolicyId HAVING COUNT([Policy].PolicyId) < 1 )
--             END))

		
		
END