CREATE PROCEDURE [policy].[AmountPaidCLASSXIII]
AS
BEGIN


If(OBJECT_ID('tempdb..#TempAmountPaidCLASSXIII') Is Not Null)
Begin
    Drop Table #TempAmountPaidCLASSXIII
End

create table #TempAmountPaidCLASSXIII
(
    ROEStatus VARCHAR(15),
	Paid DECIMAL(18,2),
	ShortPaid DECIMAL(18,2),
	Total DECIMAL(18,2)
)

DECLARE @UpdatedNotPaid DECIMAL(18,2) = 0;
DECLARE @UpdatedPaid DECIMAL(18,2) = 0;
DECLARE @UpdatedShortPaid DECIMAL(18,2) = 0;
DECLARE @UpdatedTotal DECIMAL(18,2) = 0;

DECLARE @NotUpdatedNotPaid DECIMAL(18,2) = 0;
DECLARE @NotUpdatedPaid DECIMAL(18,2) = 0;
DECLARE @NotUpdatedShortPaid DECIMAL(18,2) = 0;
DECLARE @NotUpdatedTotal DECIMAL(18,2) = 0;

INSERT INTO #TempAmountPaidCLASSXIII(ROEStatus)
 VALUES ('Not Updated')

INSERT INTO #TempAmountPaidCLASSXIII(ROEStatus)
 VALUES ('Updated')

SET @NotUpdatedPaid = (SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 1 AND [common].[DeclarationType].id <> 2 AND [Company].IndustryClassId = 13)



SET @NotUpdatedShortPaid = (SELECT COUNT(*) 
						    FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 4 AND [common].[DeclarationType].id <> 2 AND [Company].IndustryClassId = 13)

SET @NotUpdatedTotal =  @NotUpdatedPaid + @NotUpdatedShortPaid;

UPDATE #TempAmountPaidCLASSXIII
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
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 1 AND [common].[DeclarationType].id = 2 AND [Company].IndustryClassId = 13 )

SET @UpdatedShortPaid = (SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 4 AND [common].[DeclarationType].id = 2 AND [Company].IndustryClassId = 13 )

SET @UpdatedTotal =  @UpdatedPaid + @UpdatedShortPaid;

UPDATE #TempAmountPaidCLASSXIII
SET Paid = @UpdatedPaid,
	ShortPaid = @UpdatedShortPaid,
	Total = @UpdatedTotal
WHERE ROEStatus = 'Updated'

SELECT * FROM #TempAmountPaidCLASSXIII

END