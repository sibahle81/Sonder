namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class City
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ProvinceId { get; set; }

        public override string ToString()
        {
            return Name;
        }
    }
}