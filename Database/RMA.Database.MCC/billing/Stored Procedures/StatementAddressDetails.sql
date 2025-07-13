CREATE PROCEDURE [billing].[StatementAddressDetails] 
    @invoiceId INT
AS
BEGIN
    SELECT TOP 1
        p.PolicyNumber AS policynumber,
        fp.FinPayeNumber AS finpayeNumber,
        CONVERT(VARCHAR, GETDATE(), 23) AS DocumentDate,
        UPPER(rp.DisplayName) AS displayname,
        UPPER(rpa.AddressLine1) AS addressline1,
        UPPER(rpa.AddressLine2) AS addressline2,
        UPPER(ISNULL(rpa.City, '')) AS city,
        rpa.PostalCode AS postalcode
    FROM 
        [policy].[Policy] p
        INNER JOIN [client].[RolePlayer] rp ON p.PolicyOwnerId = rp.RolePlayerId
        INNER JOIN [client].[FinPayee] fp ON rp.RolePlayerId = fp.RolePlayerId
        LEFT JOIN [client].[RolePlayerAddress] rpa 
            ON rpa.RolePlayerId = rp.RolePlayerId 
            AND rpa.AddressTypeId = 1
    WHERE 
        p.PolicyId = @invoiceId
    ORDER BY 
        rp.DisplayName; 
END
