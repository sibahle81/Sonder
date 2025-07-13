using AutoMapper;

using RMA.Service.Admin.ScheduledTaskManager.Contracts.Entities;
using RMA.Service.Admin.ScheduledTaskManager.Database.Entities;

namespace RMA.Service.Admin.ScheduledTaskManager.Mappers
{
    public class ScheduledTaskMappingProfile : Profile
    {
        /// <summary>
        /// Create the mappers that map the database types to the contract types
        /// </summary>
        public ScheduledTaskMappingProfile()
        {
            CreateMap<scheduledTask_ScheduledTask, ScheduledTask>().ReverseMap();
        }
    }
}
