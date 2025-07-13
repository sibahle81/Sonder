namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class StateProvince
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CountryId { get; set; }

        public override string ToString()
        {
            return Name;
        }
    }
}