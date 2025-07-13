
---- =============================================
---- Author:Ryan Maree
---- Create date: 2021/08/30
---- =============================================
CREATE PROCEDURE [policy].[ActiveNumberOfMembers]
AS
BEGIN

	

	--SELECT 
	--COALESCE([Company].IndustryClassId, 4) AS IndustryClassId,
	--COUNT([Invoice].InvoiceStatusId) AS [Count],
	--[Invoice].InvoiceStatusId AS InvoiceStatusId,
	--SUM([policy].AnnualPremium) AS [Premium]
	--FROM policy.Policy [Policy]
	--INNER JOIN client.RolePlayer [RolePlayer] ON [Policy].PolicyOwnerId = [RolePlayer].RolePlayerId
	--INNER JOIN client.Company [Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId
	--INNER JOIN billing.Invoice [Invoice] ON [Invoice].PolicyId = [Policy].PolicyId
	--GROUP BY 
	--[Company].IndustryClassId,
	--[Invoice].InvoiceStatusId
	--ORDER BY [Company].IndustryClassId

	If(OBJECT_ID('tempdb..#tempActiveNumberOfMembersIV') Is Not Null)
Begin
    Drop Table #tempActiveNumberOfMembersIV
End

create table #tempActiveNumberOfMembersIV
(
    ROEStatus VARCHAR(15),
	NotPaid DECIMAL(18,2),
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
DECLARE @NotUpdatedShortPaid DECIMAL(18,2)= 0;
DECLARE @NotUpdatedTotal DECIMAL(18,2) = 0;

INSERT INTO #tempActiveNumberOfMembersIV(ROEStatus)
 VALUES ('Not Updated')

INSERT INTO #tempActiveNumberOfMembersIV(ROEStatus)
 VALUES ('Updated')

SET @NotUpdatedNotPaid = ISNULL((SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 2 AND [common].[DeclarationType].id <> 2 AND [Company].IndustryClassId = 4),0)

SET @NotUpdatedPaid = ISNULL((SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 1 AND [common].[DeclarationType].id <> 2 AND [Company].IndustryClassId = 4 ),0)

SET @NotUpdatedShortPaid = ISNULL((SELECT COUNT(*) 
						    FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 4 AND [common].[DeclarationType].id <> 2 AND [Company].IndustryClassId = 4),0)


SET @NotUpdatedTotal = @NotUpdatedNotPaid + @NotUpdatedPaid + @NotUpdatedShortPaid;

UPDATE #tempActiveNumberOfMembersIV
SET NotPaid = @NotUpdatedNotPaid,
    Paid = @NotUpdatedPaid,
	ShortPaid = @NotUpdatedShortPaid,
	Total = @NotUpdatedTotal
WHERE ROEStatus = 'Not Updated'


SET @UpdatedNotPaid = ISNULL((SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 2 AND [common].[DeclarationType].id = 2 AND [Company].IndustryClassId = 4 ),0)

SET @UpdatedPaid = ISNULL((SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 1 AND [common].[DeclarationType].id = 2 AND [Company].IndustryClassId = 4 ),0)

SET @UpdatedShortPaid = ISNULL((SELECT COUNT(*) 
						   FROM [client].[Declaration] INNER JOIN
							    [common].[DeclarationType] ON [common].[DeclarationType].Id = [client].[Declaration].DeclarationTypeId INNER JOIN
								[client].[RolePlayer] ON [client].[RolePlayer].RolePlayerId = [client].[Declaration].RolePlayerId INNER JOIN
								[client].[Company] ON [Company].RolePlayerId = [RolePlayer].RolePlayerId INNER JOIN
								[policy].[Policy] ON [policy].[Policy].[PolicyOwnerId] = [client].[RolePlayer].RolePlayerId INNER JOIN
								[billing].[Invoice] ON [billing].[Invoice].[PolicyId] =  [policy].[Policy].PolicyId 
							WHERE [billing].[Invoice].InvoiceStatusId = 4 AND [common].[DeclarationType].id = 2 AND [Company].IndustryClassId = 4 ),0)



SET @UpdatedTotal = @UpdatedNotPaid + @UpdatedPaid + @UpdatedShortPaid;

UPDATE #tempActiveNumberOfMembersIV
SET NotPaid = @UpdatedNotPaid,
    Paid = @UpdatedPaid,
	ShortPaid = @UpdatedShortPaid,
	Total = @UpdatedTotal
WHERE ROEStatus = 'Updated'

SELECT * FROM #tempActiveNumberOfMembersIV


END