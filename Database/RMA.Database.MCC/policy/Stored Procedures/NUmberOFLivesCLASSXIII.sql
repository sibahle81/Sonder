CREATE PROCEDURE [policy].[NUmberOFLivesCLASSXIII]
AS
BEGIN


If(OBJECT_ID('tempdb..#TempNUmberOFLivesCLASSXIII') Is Not Null)
Begin
    Drop Table #TempNUmberOFLivesCLASSXIII
End

create table #TempNUmberOFLivesCLASSXIII
(
    ROEStatus NVARCHAR(15),
	Paid DECIMAL(18,2),
	ShortPaid DECIMAL(18,2),
	Total DECIMAL(18,2)
)

DECLARE @UpdatedNotPaid DECIMAL(18,2) = 0;
DECLARE @UpdatedPaid DECIMAL(18,2) = 0;
DECLARE @UpdatedShortPaid DECIMAL(18,2) = 0;
DECLARE @UpdatedTotal DECIMAL(18,2) = 0;

DECLARE @NotUpdatedNotPaid INT = 0;
DECLARE @NotUpdatedPaid INT = 0;
DECLARE @NotUpdatedShortPaid INT = 0;
DECLARE @NotUpdatedTotal INT = 0;

INSERT INTO #TempNUmberOFLivesCLASSXIII(ROEStatus)
 VALUES ('Not Updated')

INSERT INTO #TempNUmberOFLivesCLASSXIII(ROEStatus)
 VALUES ('Updated')

SET @NotUpdatedPaid = (SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId INNER JOIN
								[policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].[PolicyId] = [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 1 AND [common].[DeclarationType].id <> 2 AND [Company].IndustryClassId = 13)



SET @NotUpdatedShortPaid = (SELECT COUNT(*) 
						    FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId INNER JOIN
								[policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].[PolicyId] = [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 4 AND [common].[DeclarationType].id <> 2 AND [Company].IndustryClassId = 13)

IF @NotUpdatedPaid IS NULL 
BEGIN
	SET @NotUpdatedPaid = 0;
END
IF @NotUpdatedShortPaid IS NULL
BEGIN
	SET @NotUpdatedShortPaid = 0;
END


SET @NotUpdatedTotal =  @NotUpdatedPaid + @NotUpdatedShortPaid;

UPDATE #TempNUmberOFLivesCLASSXIII
SET Paid = @NotUpdatedPaid,
	ShortPaid = @NotUpdatedShortPaid,
	Total = @NotUpdatedTotal
WHERE ROEStatus = 'Not Updated'




SET @UpdatedPaid = (SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId INNER JOIN
								[policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].[PolicyId] = [policy].[Policy].PolicyId
							WHERE [billing].[Invoice].InvoiceStatusId = 1 AND [common].[DeclarationType].id = 2 AND [Company].IndustryClassId = 13 )

SET @UpdatedShortPaid = (SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId INNER JOIN
								[policy].[PolicyInsuredLives] ON [policy].[PolicyInsuredLives].[PolicyId] = [policy].[Policy].PolicyId
							WHERE [billing].[Invoice].InvoiceStatusId = 4 AND [common].[DeclarationType].id = 2 AND [Company].IndustryClassId = 13 )

IF @UpdatedPaid IS NULL 
BEGIN
	SET @UpdatedPaid = 0;
END
IF @UpdatedShortPaid IS NULL
BEGIN
	SET @UpdatedShortPaid = 0;
END

SET @UpdatedTotal =  @UpdatedPaid + @UpdatedShortPaid;

UPDATE #TempNUmberOFLivesCLASSXIII
SET Paid = @UpdatedPaid,
	ShortPaid = @UpdatedShortPaid,
	Total = @UpdatedTotal
WHERE ROEStatus = 'Updated'

SELECT * FROM #TempNUmberOFLivesCLASSXIII

END