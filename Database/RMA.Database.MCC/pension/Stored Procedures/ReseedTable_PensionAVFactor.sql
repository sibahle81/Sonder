

CREATE PROCEDURE [pension].[ReseedTable_PensionAVFactor]

AS

/*
EXEC [pension].[ReseedTable_PensionAVFactor]
*/

BEGIN

	DBCC CHECKIDENT('pension.PensionAVFactor');

	DELETE FROM pension.PensionAVFactor WHERE PensionAVFactorId > 152;

	DECLARE @PensionAVFactorIdMax AS INTEGER;

	SELECT @PensionAVFactorIdMax = (MAX(PensionAVFactorId) - 1) FROM pension.PensionAVFactor;

	DBCC CHECKIDENT('pension.PensionAVFactor', RESEED, @PensionAVFactorIdMax);

END