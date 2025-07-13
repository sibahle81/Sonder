CREATE  FUNCTION [claim].[GetLatestEventNote](@claimId int)
    RETURNS CHAR(100) AS
    BEGIN
        RETURN (SELECT top 1 [Text]  FROM [claim].[ClaimNote] (NOLOCK) 
						WHERE (ClaimId = @claimId and [Text] is not null)
						ORDER BY CreatedDate desc )
    END
