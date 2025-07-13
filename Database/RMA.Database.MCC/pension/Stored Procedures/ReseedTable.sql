
CREATE PROCEDURE [pension].[ReseedTable]
       @TableName AS VARCHAR(100),
       @LastIdentityValue AS INTEGER

AS
/*
EXEC [pension].[ReseedTable] 'pension.PensionAVFactorChild',
	40
*/
BEGIN

DBCC CHECKIDENT(@TableName);

DELETE FROM pension.PensionAVFactorChild WHERE PensionAVFactorChildId > @LastIdentityValue;

DECLARE @PensionAVFactorChildIdMax AS INTEGER;
SELECT @PensionAVFactorChildIdMax = (MAX(PensionAVFactorChildId) - 1) FROM pension.PensionAVFactorChild;
DBCC CHECKIDENT(@TableName, RESEED, @PensionAVFactorChildIdMax);

END