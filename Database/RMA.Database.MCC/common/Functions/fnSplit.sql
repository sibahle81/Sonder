CREATE FUNCTION [common].[fnSplit] 
   (  @Delimiter VARCHAR(5), 
      @List      VARCHAR(max)
   ) 
   RETURNS @TableOfValues TABLE 
      (  RowID   int IDENTITY(1,1), 
         [Value] VARCHAR(8000) 
      ) 
AS 
BEGIN
    
      DECLARE @LenString INT 
 
      WHILE LEN( @List ) > 0 
         BEGIN 
         
            SELECT @LenString = 
               (CASE CHARINDEX( @Delimiter, @List ) 
                   WHEN 0 THEN LEN( @List ) 
                   ELSE ( CHARINDEX( @Delimiter, @List ) -1 )
                END
               ) 
                                
            INSERT INTO @TableOfValues 
               SELECT SUBSTRING( @List, 1, @LenString )
                
            SELECT @List = 
               (CASE ( LEN( @List ) - @LenString ) 
                   WHEN 0 THEN '' 
                   ELSE RIGHT( @List, LEN( @List ) - @LenString - 1 ) 
                END
               ) 
         END
          
      RETURN 
      
END
