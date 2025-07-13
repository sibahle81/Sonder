

CREATE PROCEDURE [pension].[ChilExtensionFormLetter] 
	@LedgerId int
AS
BEGIN
	
	SET NOCOUNT ON;

    
	SELECT    top 1    client.Person.FirstName, client.Person.Surname, pension.LedgerExtension.DateRequested, pension.LedgerExtension.EffectiveDate, pension.LedgerExtension.EndDate, pension.Ledger.NormalMonthlyPension, 
                         pension.LedgerExtension.ExtensionStatusId, client.Person.IdNumber
FROM            pension.Ledger INNER JOIN
                         pension.LedgerExtension ON pension.Ledger.PensionLedgerId = pension.LedgerExtension.LedgerId CROSS JOIN
                         client.Person INNER JOIN
                         pension.PensionRecipient ON client.Person.RolePlayerId = pension.PensionRecipient.PersonId
						
END