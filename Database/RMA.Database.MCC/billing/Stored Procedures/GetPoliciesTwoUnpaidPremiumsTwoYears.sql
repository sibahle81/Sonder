CREATE PROCEDURE [billing].[GetPoliciesTwoUnpaidPremiumsTwoYears]
@invoiceStatusId int,
@monthEndDate DATETIME 
AS
    BEGIN	
		SELECT   BI.[PolicyId], CR.CellNumber, CR.EmailAddress, PP.PolicyNumber, CR.PreferredCommunicationTypeId, BR.Email AS CCEmail, CR.DisplayName,CR.TellNumber,BI.InvoiceDate
					FROM [billing].[Invoice] BI
					JOIN [policy].[Policy] PP ON BI.PolicyId = PP.PolicyId
					JOIN [client].[RolePlayer] CR ON PP.PolicyOwnerId = CR.RolePlayerId
					LEFT JOIN [broker].[Representative] BR ON PP.RepresentativeId = BR.Id
					WHERE BI.PolicyId IN (
					SELECT  I.[PolicyId] FROM [billing].[Invoice] I
					GROUP BY I.[PolicyId],I.InvoiceStatusId		
					HAVING COUNT (I.PolicyId) > 1 AND  I.InvoiceStatusId = @invoiceStatusId
					AND DATEDIFF(month, MIN(I.InvoiceDate), MAX(I.InvoiceDate)) < 24 
					AND DATEDIFF(month, MIN(I.InvoiceDate), MAX(I.InvoiceDate)) <> 1) 
					AND PP.PolicyStatusId IN (SELECT Id FROM  [common].[PolicyStatus] 
					WHERE Name in ('Active','Reinstated'))
    END
