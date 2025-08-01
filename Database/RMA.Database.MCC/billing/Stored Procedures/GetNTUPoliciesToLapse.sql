CREATE PROCEDURE [billing].[GetNTUPoliciesToLapse]
@invoiceStatusId int,
@monthEndDate DATETIME 
AS
   BEGIN	
		SELECT  pp.[PolicyId]
		FROM  [policy].[Policy] PP 
		GROUP BY pp.[PolicyId],PP.PolicyStatusId
		HAVING  DATEDIFF(DAY, MIN(pp.CreatedDate), @monthEndDate) > 60	
		AND PP.PolicyStatusId IN (SELECT Id FROM  [common].[PolicyStatus] WHERE Name in ('Not Taken Up','Pending First Premium'))
		 
    END

