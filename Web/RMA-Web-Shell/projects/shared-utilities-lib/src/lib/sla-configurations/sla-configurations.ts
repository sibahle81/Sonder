import { PublicHoliday } from "projects/admin/src/app/configuration-manager/shared/public-holiday";
import { SLAItemTypeEnum } from "projects/shared-models-lib/src/lib/sla/sla-item-type-enum";
import { SLAItemTypeConfiguration } from "projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-item-type-configuration";

export class slaConfigurationsHelper {

  static getSlaConfiguration(slaItemType: SLAItemTypeEnum): SLAItemTypeConfiguration {
    const slaItemTypeConfigurationString = sessionStorage.getItem('sla-configurations');
    const model: SLAItemTypeConfiguration[] = slaItemTypeConfigurationString == null ? null : JSON.parse(slaItemTypeConfigurationString);

    if (!model) { return null; }
    return model.find(x => x.slaItemType === slaItemType);
  }

  static getPublicHolidays(): string[] {
    const publicHolidays = sessionStorage.getItem('public-holidays');
  
    if (!publicHolidays) {
      return [];
    }
  
    try {
      const model: PublicHoliday[] = JSON.parse(publicHolidays);
  
      if (!Array.isArray(model)) {
        return [];
      }
  
      // Ensure all dates are converted to string format
      return model.map(publicHoliday => 
        typeof publicHoliday.holidayDate === "string" 
          ? publicHoliday.holidayDate 
          : new Date(publicHoliday.holidayDate).toISOString().split("T")[0] // Convert to YYYY-MM-DD
      );
    } catch (error) {
      return [];
    }
  }
  
  
}
