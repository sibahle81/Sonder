
CREATE Procedure [common].[GetPaymentMethod]
as
begin
SELECT [Id]
      ,[Name]
  FROM [common].[PaymentMethod]
end