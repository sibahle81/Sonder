
--EXEC POPI.USP_AddDataInformationTypeEP
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: Column Extended Properties (RMADataInformationType)
-- =============================================

CREATE PROCEDURE [POPI].[USP_AddDataInformationTypeEP]
	-- Add the parameters for the stored procedure here
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.


	SET NOCOUNT ON;

	--IF DAY(GETDATE()) <> 1
	--	RETURN;

	DECLARE	 @RowCount				INT = 1
			,@TotalCount			INT = 0
			,@SQLCommand			VARCHAR(8000)
			,@TableID				INT
			,@ColumnID				INT

	DROP TABLE IF EXISTS #TempRMADataClassification

	
SELECT 
DISTINCT
S.name as [Schema],
O.object_id AS [TableID],
O.name AS [Table],
c.column_id AS [ColumnID],
c.name AS [Column],
ep.name AS [ExtendedPropertyName],
ep.value AS [CurrentExtendedPropertyValue],
dc.RMADataClassification,
dc.RMADataInformationType,
dc.RMAIsPOPI,

 'RMADataInformationType' AS NewExtendedPropertyName,
CASE
WHEN (dc.RMADataInformationType IS NOT NULL) THEN dc.RMADataInformationType
ELSE 'Unknown'
END AS [NewExtendedPropertyValue],
--ep.value as [OLDExtendedPropertyValue],
 CASE
WHEN (ISNULL(ep.name,'') <> 'RMADataInformationType')-- AND ep.major_id IS NULL AND ep.minor_id IS NULL)
THEN
'
EXECUTE sp_addextendedproperty @name = N''RMADataInformationType''
,@value = N''' + CASE WHEN (dc.RMADataInformationType IS NOT NULL) THEN dc.RMADataInformationType ELSE 'Unknown' END + '''
,@level0type = N''SCHEMA''
,@level0name = ''' + S.name + '''
,@level1type = N''Table''
,@level1name = ''' + O.name + '''
,@level2type = ''Column''
,@level2name = ''' + c.name + ''';
'
ELSE
'
EXECUTE sp_updateextendedproperty @name = N''RMADataInformationType''
,@value = N''' + CASE WHEN (dc.RMADataInformationType IS NOT NULL) THEN dc.RMADataInformationType ELSE 'Unknown' END + '''
,@level0type = N''SCHEMA''
,@level0name = ''' + S.name + '''
,@level1type = N''Table''
,@level1name = ''' + O.name + '''
,@level2type = ''Column''
,@level2name = ''' + c.name + ''';
'
END AS [TSQL_RMADataClassification]

	INTO #TempRMADataInformation_type

FROM sys.all_objects O --ON ep.major_id = O.object_id
LEFT JOIN sys.schemas S on O.schema_id = S.schema_id
LEFT JOIN sys.columns AS c ON o.[object_id] = c.[object_id]

LEFT JOIN sys.extended_properties EP ON (O.[object_id] = ep.major_id) AND (c.[object_id] = ep.major_id) AND (c.column_id = ep.minor_id)
AND (ep.name = 'RMADataInformationType')


LEFT JOIN  [dbo].[PopiMaster] dc ON (S.[name] = dc.Table_Schema) AND (O.[name] = dc.[Table_Name]) AND (c.[name] = dc.[Column_Name])

WHERE  (o.[type] = 'U')

AND (((dc.[RMADataInformationType] IS NOT NULL) AND (ep.[value] <> dc.[RMADataInformationType]) AND (ep.[name] = 'RMADataInformationType')) OR ( ISNULL(ep.[name],'')='') OR ( ISNULL(dc.[RMADataInformationType],'')='' AND ISNULL(ep.[name],'') = 'RMADataInformationType' AND ep.[value] NOT IN ('Unknown')))
AND (S.name <>'sys')



ORDER BY 1,2,3


	SELECT @TotalCount = (SELECT COUNT(1) FROM #TempRMADataInformation_type)

	IF @TotalCount > 0
	BEGIN

		WHILE @RowCount <= @TotalCount
		BEGIN

			SELECT
					 TOP 1
					 @TableID = [TableID]
					,@ColumnID = [ColumnID]
					,@SQLCommand = [TSQL_RMADataClassification]
			FROM #TempRMADataInformation_type
			ORDER BY
						 [TableID]
						,[ColumnID]

			--SELECT @TableID, @ColumnID, @SQLCommand

			--PRINT @SQLCommand
			EXEC (@SQLCommand)

			DELETE FROM #TempRMADataInformation_type
			WHERE ([TableID] = @TableID)
			AND ([ColumnID] = @ColumnID)

			SELECT @RowCount = @RowCount + 1
		END
	END

	DROP TABLE IF EXISTS #TempRMADataInformation_type

END