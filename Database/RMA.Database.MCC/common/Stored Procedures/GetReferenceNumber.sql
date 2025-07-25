CREATE PROCEDURE [common].[GetReferenceNumber]
    @DocumentType VARCHAR(50) = NULL
AS
    BEGIN
		DECLARE @NextID INT

        UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
        SET     GenerationDate = CONVERT(DATE, GETDATE()) ,
                NextNumber = 0
        WHERE   Name = @DocumentType 
                AND GenerationDate < CONVERT(DATE, GETDATE());

        UPDATE  Common.DocumentNumbers WITH (UPDLOCK)
        SET     @NextID = NextNumber = NextNumber + 1
        WHERE   Name = @DocumentType; 

        SELECT  d.Id,
				d.Name ,
                @NextID AS NextNumber ,
                d.Format ,
                d.PrefixSuffixLength ,
                d.IsDateBound ,
                d.GenerationDate
        FROM    Common.DocumentNumbers d (NOLOCK)
        WHERE   d.Name = @DocumentType	 ;

    END;

