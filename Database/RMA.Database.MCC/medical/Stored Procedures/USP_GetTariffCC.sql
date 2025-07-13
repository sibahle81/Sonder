CREATE PROCEDURE [medical].[USP_GetTariffCC]
@IsChronic INT, 
@MedicalServiceProviderID INT,
@ServiceDate DATETIME, 
@TariffCode VARCHAR(20)
AS
BEGIN

	DECLARE @MSPAgreedTariff TABLE(TariffTypeID INT)

	INSERT INTO @MSPAgreedTariff
	SELECT DISTINCT MSPAT.TariffTypeID
	FROM [medical].[MedicalServiceProviderCC] MSP WITH(NOLOCK)
	INNER JOIN [medical].[MSPAgreedTariffCC] MSPAT WITH(NOLOCK) ON MSPAT.MedicalServiceProviderID = MSP.MedicalServiceProviderID
	WHERE MSP.MedicalServiceProviderID = @MedicalServiceProviderID
	AND @ServiceDate BETWEEN MSPAT.ValidFrom AND MSPAT.ValidTo
	AND MSPAT.IsChronic = @IsChronic

	SELECT TOP 1  T.TariffID, T.ItemCode, MI.Description, MI.MedicalItemId, T.RecommendedUnits * TBUC.UnitPrice AS TariffAmount, T.TariffTypeID
	FROM [medical].[TariffCC] T WITH(NOLOCK)
	INNER JOIN [medical].[TariffTypeCC] TT WITH(NOLOCK) ON TT.TariffTypeID = T.TariffTypeID
	INNER JOIN [medical].[MedicalItemCC] MI WITH(NOLOCK) ON MI.MedicalItemID = T.MedicalitemID
	INNER JOIN [medical].[TariffBaseUnitCostCC] TBUC WITH(NOLOCK) ON TBUC.TariffBaseUnitCostID = T.TariffBaseUnitCostID
	WHERE T.ItemCode = @TariffCode
	AND @ServiceDate BETWEEN T.ValidFrom AND T.ValidTo
	AND T.PractitionerTypeId = (SELECT TOP 1 PractitionerTypeID FROM [medical].[MedicalServiceProviderCC] WHERE MedicalServiceProviderID = @MedicalServiceProviderID)
	AND T.TariffTypeId IN (SELECT TariffTypeID FROM @MSPAgreedTariff)

END