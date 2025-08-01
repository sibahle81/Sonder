CREATE PROCEDURE [maintenance].[CleanupBrokers]
AS
	SELECT id INTO #ids FROM broker.Brokerage WHERE IsActive = 0
	DELETE FROM broker.BrokerageContact WHERE BrokerageId IN (SELECT id FROM #ids)
	DELETE FROM broker.BrokerageBankAccount WHERE BrokerageId IN (SELECT id FROM #ids)
	DELETE FROM broker.BrokerageFscaLicenseCategory WHERE BrokerageId IN (SELECT id FROM #ids)
	DELETE FROM broker.BrokerageProductOption WHERE BrokerageId IN (SELECT id FROM #ids)
	DELETE FROM broker.BrokerageAddress  WHERE BrokerageId IN (SELECT id FROM #ids)
	DELETE FROM broker.BrokerageBrokerConsultant WHERE BrokerageId IN (SELECT id FROM #ids)
	DELETE FROM broker.BrokerageNote WHERE BrokerageId IN (SELECT id FROM #ids)
	DELETE FROM broker.BrokerageRepresentative WHERE BrokerageId IN   (SELECT id FROM #ids)
	DELETE FROM broker.RepresentativeFscaLicenseCategory WHERE BrokerageId IN   (SELECT id FROM #ids)
	DELETE FROM broker.Brokerage WHERE id IN   (SELECT id FROM #ids)
	SELECT Id into #RepIds FROM broker.Representative WHERE id NOT IN (SELECT DISTINCT representativeId FROM broker.RepresentativeFscaLicenseCategory )
	DELETE FROM broker.BrokerageRepresentative WHERE RepresentativeId IN (SELECT id FROM #RepIds)
	DELETE FROM broker.RepQualification WHERE RepresentativeId IN (SELECT id FROM #RepIds)
	DELETE FROM broker.Representative WHERE id IN (SELECT id FROM #RepIds)

	DELETE FROM bpm.Note WHERE ItemId IN (SELECT Id FROM bpm.Wizard WHERE WizardConfigurationId IN (19,20,17,16))
	DELETE from bpm.Wizard WHERE WizardConfigurationId IN (19,20,17,16)

	DELETE FROM client.LastViewed WHERE ItemType = 'Representative' AND ItemId NOT IN (SELECT Id FROM broker.Representative)
	DELETE FROM client.LastViewed WHERE ItemType = 'Brokerage' AND ItemId NOT IN (SELECT Id FROM broker.Brokerage)
	DELETE FROM client.AuditLog WHERE ItemType = 'Representative' AND ItemId NOT IN (SELECT Id FROM broker.Representative)
	DELETE FROM client.AuditLog WHERE ItemType = 'Brokerage' AND ItemId NOT IN (SELECT Id FROM broker.Brokerage)

	DECLARE @maxId INT

	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.Brokerage
	DBCC CHECKIDENT ('broker.Brokerage' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.RepresentativeFscaLicenseCategory
	DBCC CHECKIDENT ('broker.RepresentativeFscaLicenseCategory' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.BrokerageRepresentative
	DBCC CHECKIDENT ('broker.BrokerageRepresentative' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.BrokerageNote
	DBCC CHECKIDENT ('broker.BrokerageNote' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.BrokerageAddress
	DBCC CHECKIDENT ('broker.BrokerageAddress' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.BrokerageFscaLicenseCategory
	DBCC CHECKIDENT ('broker.BrokerageFscaLicenseCategory' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.BrokerageBankAccount
	DBCC CHECKIDENT ('broker.BrokerageContact' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.BrokerageBankAccount
	DBCC CHECKIDENT ('broker.BrokerageContact' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.Representative
	DBCC CHECKIDENT ('broker.Representative' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.RepQualification
	DBCC CHECKIDENT ('broker.RepQualification' , RESEED, @maxId)
	SELECT @maxId = ISNULL(MAX(Id), 0) FROM broker.BrokerageRepresentative
	DBCC CHECKIDENT ('broker.BrokerageRepresentative' , RESEED, @maxId)
