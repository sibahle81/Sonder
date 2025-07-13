
--EXEC [POPI].[USP_AddDataclassificationEP]
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: Column Extended Properties (RMADataClassfication)
-- =============================================

CREATE PROCEDURE [POPI].[USP_AddDataclassificationEP]
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

 'RMADataClassification' AS NewExtendedPropertyName,
CASE
WHEN (dc.RMADataClassification IS NOT NULL) THEN dc.RMADataClassification
ELSE 'Internal'
END AS [NewExtendedPropertyValue],
		--CASE
		--		WHEN ((dc.[RMADataClassification] IS NOT NULL) AND (ep.[value] <> dc.[RMADataClassification]) AND ISNULL(ep.[name],'') = 'RMADataClassification' OR ( ISNULL(dc.[RMADataClassification],'')='' AND ISNULL(ep.[name],'') = 'RMADataClassification' AND ep.[value] IN ('Sensitive')))
		--			THEN 'REVOKE SELECT ON OBJECT::[' + S.[name] + '].[' + O.[name] + ']([' + c.[name] + ']) FROM [RMA\Confidential]; REVOKE SELECT ON OBJECT::[' + S.[name] + '].[' + O.[name] + ']([' + c.[name] + ']) FROM [RMA\Internal]; REVOKE SELECT ON OBJECT::[' + S.[name] + '].[' + O.[name] + ']([' + c.[name] + ']) FROM [RMA\Public];'
		--		WHEN ((dc.[RMADataClassification] IS NOT NULL) AND (ep.[value] <> dc.[RMADataClassification]) AND ISNULL(ep.[name],'') = 'RMADataClassification' OR ( ISNULL(dc.[RMADataClassification],'')='' AND ISNULL(ep.[name],'') = 'RMADataClassification' AND ep.[value] IN ('Confidential')))
		--			THEN 'REVOKE SELECT ON OBJECT::[' + S.[name] + '].[' + O.[name] + ']([' + c.[name] + ']) FROM [RMA\Internal]; REVOKE SELECT ON OBJECT::[' + S.[name] + '].[' + O.[name] + ']([' + c.[name] + ']) FROM [RMA\Public];'
		--		WHEN ((dc.[RMADataClassification] IS NOT NULL) AND (ep.[value] <> dc.[RMADataClassification]) AND ISNULL(ep.[name],'') = 'RMADataClassification' OR ( ISNULL(dc.[RMADataClassification],'')='' AND ISNULL(ep.[name],'') = 'RMADataClassification' AND ep.[value] IN ('Internal')))
		--			THEN 'REVOKE SELECT ON OBJECT::[' + S.[name] + '].[' + O.[name] + ']([' + c.[name] + ']) FROM [RMA\Public];'
		--		ELSE ''	
		--	END AS [RevokePreviousPermissions],		
			
			

 CASE
WHEN (ISNULL(ep.name,'') <> 'RMADataClassification')-- AND ep.major_id IS NULL AND ep.minor_id IS NULL)
THEN
'
EXECUTE sp_addextendedproperty @name = N''RMADataClassification''
,@value = N''' + CASE WHEN (dc.RMADataClassification IS NOT NULL) THEN dc.RMADataClassification ELSE 'Internal' END + '''
,@level0type = N''SCHEMA''
,@level0name = ''' + S.name + '''
,@level1type = N''Table''
,@level1name = ''' + O.name + '''
,@level2type = ''Column''
,@level2name = ''' + c.name + ''';
'
ELSE
'
EXECUTE sp_updateextendedproperty @name = N''RMADataClassification''
,@value = N''' + CASE WHEN (dc.RMADataClassification IS NOT NULL) THEN dc.RMADataClassification ELSE 'Internal' END + '''
,@level0type = N''SCHEMA''
,@level0name = ''' + S.name + '''
,@level1type = N''Table''
,@level1name = ''' + O.name + '''
,@level2type = ''Column''
,@level2name = ''' + c.name + ''';
'
END AS [TSQL_RMADataClassification]

	INTO #TempRMADataClassification



--select * 
FROM sys.all_objects O --ON ep.major_id = O.object_id
LEFT JOIN sys.schemas S on O.schema_id = S.schema_id
--LEFT JOIN sys.columns AS c ON ep.major_id = c.object_id AND ep.minor_id = c.column_id
LEFT JOIN sys.columns AS c ON o.[object_id] = c.[object_id]

LEFT JOIN sys.extended_properties EP ON (O.[object_id] = ep.major_id) AND (c.[object_id] = ep.major_id) AND (c.column_id = ep.minor_id)
AND (ep.name = 'RMADataClassification')

LEFT JOIN  [dbo].[PopiMaster] dc ON (S.[name] = dc.Table_Schema) AND (O.[name] = dc.[Table_Name]) AND (c.[name] = dc.[Column_Name])
WHERE (o.[type] = 'U')
AND (((dc.RMADataClassification IS NOT NULL) AND (ep.[value] <> dc.RMADataClassification) AND ISNULL(ep.[name],'') = 'RMADataClassification') OR ( ISNULL(ep.[name],'')='') OR ( ISNULL(dc.RMADataClassification,'')='' AND ISNULL(ep.[name],'') = 'RMADataClassification' AND ep.[value] IN ('Sensitive','Confidential')) OR (ep.[value] <> CASE
																																																																																WHEN (dc.RMADataClassification IS NOT NULL) THEN dc.RMADataClassification
																																																																																			ELSE 'Internal'
																																																																																				END))

 AND (S.name <>'sys')

	ORDER BY 1,2,3

	SELECT @TotalCount = (SELECT COUNT(1) FROM #TempRMADataClassification)

	IF @TotalCount > 0
	BEGIN

		WHILE @RowCount <= @TotalCount
		BEGIN

			SELECT
					 TOP 1
					 @TableID = [TableID]
					,@ColumnID = [ColumnID]
					,@SQLCommand = [TSQL_RMADataClassification]
			FROM #TempRMADataClassification
			ORDER BY
						 [TableID]
						,[ColumnID]

			--SELECT @TableID, @ColumnID, @SQLCommand

			--PRINT @SQLCommand
			EXEC (@SQLCommand)

			DELETE FROM #TempRMADataClassification
			WHERE ([TableID] = @TableID)
			AND ([ColumnID] = @ColumnID)

			SELECT @RowCount = @RowCount + 1
		END
	END

	DROP TABLE IF EXISTS #TempRMADataClassification

END