-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023/03/30
-- =============================================
CREATE   PROCEDURE [billing].[TermArrangementProductBalances] 
    @termArrangementId int
	as 
	begin    

declare @productTerms table (productOptionId int, productName varchar(100), balance decimal(18,2))

insert into @productTerms
select  tp.ProductOptionId,case when po.description  ='COID Policy' then replace(po.description,'COID Policy', 'COID') 
 when po.description  ='Commuting Journey Policy' then replace(po.description,'Commuting Journey Policy', 'CJP') 
 when po.description  ='Crime Injury Commuting Journey Policy' then replace(po.description,'Crime Injury Commuting Journey Policy', 'CICJP') 
 when po.description  ='Augmentation' then replace(po.description,'Augmentation', 'AUG') 
 when po.description  ='Riot And Strike Personal Injury' then replace(po.description,'Riot And Strike Personal Injury' ,'RIOT') 
 when po.description  ='GPA' then replace(po.description,'GPA' ,'GPA') 
end as productName, tp.ContractAmount from [product].[ProductOption] po 
inner join [billing].[TermArrangementProductOption] tp on po.Id = tp.ProductOptionId
inner join billing.TermArrangement ta on tp.TermArrangementId=ta.TermArrangementId
where ta.TermArrangementId in
(select t.TermArrangementId from billing.TermArrangement t		  
where t.TermArrangementId = @termArrangementId  or t.ParentTermArrangementId =  @termArrangementId)

		 declare @products table (productName varchar(50))
		 insert into @products 
		 values ('COID'),
		('AUG'),
		('CICJP'),
		('CJP'),
		('RIOT'),
		('GPA');

	with balances(productname, balance) as 
(select productName, sum(balance) as balance  from @productTerms group by productName)		

select * from (
select * from balances) b
PIVOT(
    sum(b.balance) 
    FOR b.productname IN (
        [COID], 
        [AUG], 
        [CICJP], 
        [CJP],[RIOT],[GPA])
) AS results;

   end