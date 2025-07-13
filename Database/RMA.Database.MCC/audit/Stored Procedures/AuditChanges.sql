
CREATE PROCEDURE [audit].AuditChanges 
(
 @PrimaryKeyName varchar(100), 
 @PrimaryKeyValue varchar(100),
 @Schema varchar(10),
 @Table varchar(100),
 @ModifiedBy varchar(50)
)
AS 
BEGIN   

/*
	exec [audit].AuditChanges 
		@PrimaryKeyName ='PolicyId', 
		@PrimaryKeyValue= '21862', 
		@Schema = 'policy', 
		@Table = 'Policy', 
		@ModifiedBy = 'MMngongoma@randmutual.co.za'
*/
 
	DECLARE @jsonResult NVARCHAR(MAX)	 
	DECLARE @SQL NVARCHAR(1000)

	SET @SQL = N'SET @json = (SELECT * FROM  [' + @Schema + '].[' + @Table +'] WHERE '+@PrimaryKeyName+' = '''+ @PrimaryKeyValue +''' FOR JSON PATH)';
	EXEC sp_executesql @SQL, N'@json NVARCHAR(MAX) OUTPUT',  @json = @jsonResult OUTPUT

	INSERT [audit].[AuditLog]  (ItemId,	ItemType,	[Action],	OldItem,	NewItem,	[Date],	Username,	CorrelationToken)
	SELECT @PrimaryKeyValue, lower(@Schema) + '_' + @Table, 'Modified',@jsonResult,@jsonResult,GETDATE(),@ModifiedBy,'' 

END