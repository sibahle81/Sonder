

CREATE PROCEDURE [finance].[GroupCommissionReport]
	@StartDate		As Date,
	@EndDate		AS Date 
	
AS

BEGIN 

 
select distinct top 5
bro.Name					as 'Group_Broker',
sum(pol.AnnualPremium)      as 'Group_AnnualPremium', 
sum(pol.InstallmentPremium)	as 'Group_Premium',
pol.CommissionPercentage    as 'Group_Commission',
pol.BinderFeePercentage     as 'Group_BinderFeePercentage',
pro.Name					as 'Group_Product',
pc.Name						as 'Group_product Class' 
from [policy].[Policy] pol 
inner join  [AZD-MCC].[policy].[PolicyBroker] pb on pol.BrokerageId = pb.BrokerageId and pol.PolicyId = pb.PolicyId
inner join broker.Brokerage bro on pol.BrokerageId = bro.Id   
inner join product.ProductOption po on pol.ProductOptionId = po.Id 
inner join product.Product pro on po.ProductId = pro.Id 
inner join common.ProductClass pc on pro.ProductClassId = pc.Id 
where bro.companyType = 'Private'
and pol.CreatedDate between @StartDate and @EndDate
group by bro.Name, pol.CommissionPercentage, pro.Name,pol.BinderFeePercentage,pc.Name


END