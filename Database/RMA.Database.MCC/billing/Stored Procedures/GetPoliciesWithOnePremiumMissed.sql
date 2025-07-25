CREATE PROCEDURE [billing].[GetPoliciesWithOnePremiumMissed]
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
					WHERE MONTH(I.InvoiceDate) < MONTH(@monthEndDate)
					GROUP BY I.[PolicyId],I.InvoiceStatusId		
					HAVING COUNT (I.PolicyId) = 1 AND  I.InvoiceStatusId = @invoiceStatusId ) 
					AND PP.PolicyStatusId IN (SELECT Id FROM  [common].[PolicyStatus] 
					WHERE Name in ('Active','Reinstated'))
   END
