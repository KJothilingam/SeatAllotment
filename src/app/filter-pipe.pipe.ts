import { Pipe, PipeTransform } from '@angular/core';
import { Employee } from './interfaces/employee';

@Pipe({
  name: 'filter',
  standalone: true,
})
export class FilterPipePipe implements PipeTransform {
  transform(items: Employee[], searchText: string): Employee[] {
    if (!items || !searchText) return items;

    searchText = searchText.toLowerCase().trim();

    return items.filter((employee) => {
      const idMatch = employee.employeeid?.toString().includes(searchText);
      const nameMatch = employee.name?.toLowerCase().includes(searchText);
      const roleMatch = employee.role?.toLowerCase().includes(searchText);
      const departmentMatch = employee.department?.toLowerCase().includes(searchText);
      const seatMatch = employee.seat_id?.toString().toLowerCase().includes(searchText);

      return idMatch || nameMatch || roleMatch || departmentMatch || seatMatch;
    });
  }
}
