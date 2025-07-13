

CREATE PROCEDURE [pension].[ReseedTable_PensionAVFactorChild]

AS

/*
EXEC [pension].[ReseedTable_PensionAVFactorChild]
*/

BEGIN

	DBCC CHECKIDENT('pension.PensionAVFactorChild');

	DELETE FROM pension.PensionAVFactorChild WHERE PensionAVFactorChildId > 40;
	
	DECLARE @PensionAVFactorChildIdMax AS INTEGER;
	
	SELECT @PensionAVFactorChildIdMax = (MAX(PensionAVFactorChildId) - 1)
	FROM pension.PensionAVFactorChild;
	
	DBCC CHECKIDENT('pension.PensionAVFactorChild', RESEED, @PensionAVFactorChildIdMax);

END