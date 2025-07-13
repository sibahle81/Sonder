-- =============================================
-- Author:      Surya Ratheesh
-- Date:        05/07/2025
-- Description: Get TreatmentAuth Letter Tariff Item Details 
-- =============================================
--exec medical.GetTreatmentAuthLetterTariffItemDetails 'PAC0000156'
CREATE PROCEDURE medical.GetTreatmentAuthLetterTariffItemDetails
    @PreAuthNumber VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    ------------------------------------------------------
    --  Pre-Auth Tariff Item Details
    ------------------------------------------------------
    SELECT
        MI.ItemCode                                      AS sItemCode,
        MI.Description                                   AS sDescription,
        ISNULL(PB.RequestedTreatments, 0)                AS nQuantity,
        ISNULL(PB.TariffAmount, 0)                       AS crAmount
    FROM medical.PreAuthorisationBreakdown PB
    INNER JOIN medical.Tariff TC  ON PB.TariffId = TC.TariffId
    INNER JOIN medical.MedicalItem MI ON TC.MedicalItemId = MI.MedicalItemId
    WHERE PB.PreAuthId = (
        SELECT TOP 1 PreAuthId FROM medical.PreAuthorisation WHERE PreAuthNumber = @PreAuthNumber
    );
END
GO
