CREATE   FUNCTION [dbo].[GetBankName] (@bankBranchId int)
RETURNS varchar(50)
AS
BEGIN
	declare @bankName varchar(50)
	select @bankName = (select b.[Name] from common.BankBranch br, common.Bank b where br.Id = @bankBranchId and b.Id = br.BankId)
	return isnull(@bankName, '')
END