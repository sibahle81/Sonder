import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Department } from '../Entities/department';

@Injectable()
export class DepartmentService {

    private apiDepartment = 'clc/api/Client/Department';

    constructor(
        private readonly commonService: CommonService,
        private readonly authService: AuthService) {
    }

    getDepartment(id: number): Observable<Department> {
        return this.commonService.get<Department>(id, `${this.apiDepartment}`);
    }

    getDepartmentsByClient(clientId: number): Observable<Department[]> {
        return this.commonService.get<Department[]>(clientId, `${this.apiDepartment}/ByClient`);
    }

    addDepartment(item: Department): Observable<number> {
        return this.commonService.postGeneric<Department, number>(`${this.apiDepartment}`, item);
    }

    editDepartment(department: Department): Observable<boolean> {
        return this.commonService.edit<Department>(department, `${this.apiDepartment}`);
    }

    editDepartmentAddress(departmentId: number, addressId: number): Observable<boolean> {
        const department = new Department();
        department.id = departmentId;
        department.addressId = addressId;

        return this.commonService.edit<Department>(department, `${this.apiDepartment}/EditDepartmentAddress`);
    }

    editDepartmentBank(departmentId: number, bankAccountId: number): Observable<boolean> {
        const department = new Department();
        department.id = departmentId;
        department.bankAccountId = bankAccountId;

        return this.commonService.edit<Department>(department, `${this.apiDepartment}/EditDepartmentBank`);
    }
}
