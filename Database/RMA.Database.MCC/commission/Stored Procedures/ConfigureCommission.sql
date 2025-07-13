create PROCEDURE [commission].[ConfigureCommission]
	   @ConfigId int,
	   @CommissionTypeId int,
	   @BrokerId varchar(20),
	   @ProductIds varchar(100)
AS
BEGIN
insert into  [commission].[CommissionConfig]
values(@ConfigId,@CommissionTypeId,@BrokerId,@ProductIds)
END