CREATE PROCEDURE [medical].[GetCompCareMedicalInvoice]
(
	@InvoiceId INT
)
AS
BEGIN

DECLARE @CompCareServerName VARCHAR(50) = (SELECT base_object_name FROM sys.synonyms WHERE [Name] = 'CompCareServerName');
DECLARE @RMADatabaseName VARCHAR(50) = (SELECT base_object_name FROM sys.synonyms WHERE [Name] = 'RMADatabaseName');
DECLARE @TSQL varchar(8000);
SELECT  @TSQL = 'SELECT * FROM OPENQUERY(' + @CompCareServerName + ',''SELECT MI.MedicalInvoiceID AS InvoiceId, 
MI.SPInvoiceNumber AS InvoiceNumber, MI.SPInvoiceNumber AS HcpInvoiceNumber, MI.InvoiceDate, 
MI.DateReceived, MI.DateSubmitted, MI.DateAdmitted, MI.DateDischarged, 
MI.MedicalServiceProviderID AS HealthCareProviderId, 
MI.InvoiceTotalVAT AS InvoiceVat, MI.InvoiceTotalAmount AS InvoiceAmount, MI.PersonEventID, MI.PayeeID, MI.PayeeTypeID, MI.SPAccountNumber AS HcpAccountNumber,
CL.FileRefNumber AS ClaimReferenceNumber, MSP.[Name] AS HealthCareProviderName, MSP.PracticeNo AS PracticeNumber,
MSP.PractitionerTypeID, CL.ClaimId,
CAST(MI.PreAuthXML AS nvarchar(max)) PreAuthXML 
FROM ' + @RMADatabaseName + '.Compensation.MedicalInvoice MI
INNER JOIN ' + @RMADatabaseName + '.Compensation.Claim CL ON MI.PersonEventID = CL.PersonEventID
INNER JOIN ' + @RMADatabaseName + '.Medical.MedicalServiceProvider MSP ON MI.MedicalServiceProviderID = MSP.MedicalServiceProviderID
WHERE MedicalInvoiceID = ' + CONVERT(VARCHAR(11), @InvoiceId) + ''')'


EXEC (@TSQL)

END

