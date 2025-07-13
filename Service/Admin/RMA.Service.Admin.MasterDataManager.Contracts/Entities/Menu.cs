using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class Menu
    {
        public int Id { get; set; }
        public int ModuleId { get; set; }
        public int OderIndex { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public string Api { get; set; }
        public bool IsActive { get; set; }
    }

    public class MenuGroup
    {
        public string Title { get; set; }
        public string Acronym { get; set; }
        public List<Menu> MenuItems { get; set; }
    }
}