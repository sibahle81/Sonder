CREATE PROCEDURE [maintenance].[ClearProducts]
AS
	PRINT 'NO DELETE'
	RETURN --- DONT DELETE (JVZ - 27/1/2020)
	PRINT 'DELETE'
    BEGIN TRANSACTION

	DECLARE @maxId INT

	SELECT Id INTO #products FROM product.Product WHERE CreatedBy <> 'system@randmutual.co.za'
	SELECT Id INTO #Benefits FROM product.Benefit WHERE CreatedBy <> 'system@randmutual.co.za'
	SELECT Id INTO #productOptions FROM product.ProductOption WHERE CreatedBy <> 'system@randmutual.co.za'

	DELETE FROM product.BenefitEarningsType WHERE BenefitId IN (SELECT Id FROM #Benefits)
	DELETE FROM product.BenefitBeneficiaryType WHERE BenefitId IN (SELECT Id FROM #Benefits)
	DELETE FROM product.BenefitMedicalReportType WHERE BenefitId IN (SELECT Id FROM #Benefits)
	DELETE FROM product.ProductOptionBenefit WHERE BenefitId IN (SELECT Id FROM #Benefits)

	DELETE FROM product.BenefitRate WHERE BenefitId IN (SELECT Id FROM #Benefits)
	DELETE FROM product.BenefitRule WHERE BenefitId IN (SELECT Id FROM #Benefits)
	DELETE FROM product.BenefitNote WHERE BenefitId IN (SELECT Id FROM #Benefits)
	DELETE FROM product.Benefit WHERE Id IN (SELECT Id FROM #Benefits)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.Benefit
	DBCC CHECKIDENT ('product.benefit' , RESEED, @maxId)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.BenefitNote
	DBCC CHECKIDENT ('product.BenefitNote' , RESEED, @maxId)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.BenefitRate
	DBCC CHECKIDENT ('product.BenefitRate' , RESEED, @maxId)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.BenefitRule
	DBCC CHECKIDENT ('product.BenefitRule' , RESEED, @maxId)

	--PRODUCTS

	DELETE FROM product.ProductOptionBenefit WHERE ProductOptionId IN (SELECT Id FROM #productOptions)
	DELETE FROM product.ProductOptionRule WHERE ProductOptionId IN (SELECT Id FROM #productOptions)
	DELETE FROM product.ProductOptionNote WHERE ProductOptionId IN  (SELECT Id FROM #productOptions)
	DELETE FROM product.ProductOptionCoverType WHERE ProductOptionId IN  (SELECT Id FROM #productOptions)
	DELETE FROM product.productOptionPaymentFrequency WHERE ProductOptionId IN  (SELECT Id FROM #productOptions)
	DELETE FROM product.ProductOption WHERE Id IN  (SELECT Id FROM #productOptions)

	DELETE FROM product.ProductRule WHERE ProductId IN (SELECT Id FROM #products)
	DELETE FROM Product.ProductNote WHERE ProductId IN (SELECT Id FROM #products)
	DELETE FROM product.Product WHERE Id IN (SELECT Id FROM #products)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.ProductOptionRule
	DBCC CHECKIDENT ('product.ProductOptionRule' , RESEED, @maxId)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.ProductOption
	DBCC CHECKIDENT ('product.ProductOption' , RESEED, @maxId)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.ProductRule
	DBCC CHECKIDENT ('product.ProductRule' , RESEED, @maxId)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.ProductNote
	DBCC CHECKIDENT ('product.ProductNote' , RESEED, @maxId)

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM product.Product
	DBCC CHECKIDENT ('product.Product' , RESEED, @maxId)

	DELETE FROM product.LastViewed WHERE ItemType = 'Product' AND ItemId IN (SELECT Id FROM #products)
	DELETE FROM product.LastViewed WHERE ItemType = 'Benefit' AND ItemId IN (SELECT Id FROM #Benefits)
	DELETE FROM product.AuditLog WHERE ItemType = 'Product' AND ItemId IN (SELECT Id FROM #products)
	DELETE FROM product.AuditLog WHERE ItemType = 'Benefit' AND ItemId IN (SELECT Id FROM #Benefits)
	DELETE FROM product.AuditLog WHERE ItemType = 'ProductOption' AND ItemId IN (SELECT Id FROM #Benefits)

	--TRUNCATE TABLE product.AuditLog
	--TRUNCATE TABLE product.LastViewed

	DELETE FROM bpm.Note WHERE ItemId IN (SELECT Id FROM bpm.Wizard WHERE WizardConfigurationId IN (6,15,18))
	DELETE from bpm.Wizard WHERE WizardConfigurationId IN (6,15,18)

	DROP TABLE #Benefits
	DROP TABLE #products
	DROP TABLE #productOptions

	COMMIT
