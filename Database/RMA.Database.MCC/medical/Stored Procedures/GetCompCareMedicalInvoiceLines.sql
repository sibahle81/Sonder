CREATE PROCEDURE [medical].[GetCompCareMedicalInvoiceLines]
(
	@InvoiceId INT
)
AS
BEGIN

DECLARE @CompCareServerName VARCHAR(50) = (SELECT base_object_name FROM sys.synonyms WHERE [Name] = 'CompCareServerName');
DECLARE @RMADatabaseName VARCHAR(50) = (SELECT base_object_name FROM sys.synonyms WHERE [Name] = 'RMADatabaseName');
DECLARE @TSQL varchar(8000);

SELECT  @TSQL = 'SELECT * FROM OPENQUERY(' + @CompCareServerName + ',
''SELECT 
MIB.Quantity AS RequestedQuantity, MIB.TotalInvoiceLineVAT AS TotalTariffVat, MIB.TotalInvoiceLineVAT AS RequestedVat, MIB.TotalInvoiceLineCost, MIB.TotalInvoiceLineCost AS TotalTariffAmount, MIB.TotalInvoiceLineCost AS RequestedAmount,
MIB.TotalTariffLineIncl AS TotalTariffAmountInclusive, MIB.VATPercentage,
MIB.[Description], MIB.ICD10Code AS Icd10Code, MIB.TariffID AS TariffId,
MIB.TreatmentCodeID AS TreatmentCodeId, MIB.MedicalItemID AS MedicalItemId, MIB.CalcOperands, MIB.CreditAmount,
MT.ItemCode AS HcpTariffCode, MIB.ServiceDate, MIB.VatCodeID AS VatCode
FROM 
' + @RMADatabaseName + '.Compensation.MedicalInvoiceBreakdown MIB
LEFT JOIN ' + @RMADatabaseName + '.Medical.Tariff MT ON MIB.TariffID = MT.TariffID
WHERE MedicalInvoiceID = ' + CONVERT(VARCHAR(11), @InvoiceId) + ''')'


EXEC (@TSQL)

END