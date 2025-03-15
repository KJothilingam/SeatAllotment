import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FilterPipePipe } from '../../filter-pipe.pipe';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../interfaces/employee';

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FilterPipePipe, FormsModule, RouterLink],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  adminName: string = 'Admin';
  searchQuery = '';
  employees: Employee[] = [];

  selectedEmployee: Employee = {
    employeeid: 0,
    name: '',
    department: '',
    role: '',
    seat_id: 'Unassigned' 
  };

  newEmployee: Employee = {
    employeeid: 0,
    name: '',
    department: '',
    role: '',
    seat_id: 'Unassigned'
  };

  showModal = false;
  showEditModal = false;
  showConfirmation = false;

  currentPage = 1;
  itemsPerPage = 8;
  selectedMenu: string = 'manageEmployee';
  selectedSubMenu: string = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.fetchEmployees();
  }

  get paginatedEmployees() {
    // console.log("All Employees Data: ", this.employees); // Debugging line
  
    let filtered = this.employees.filter(emp => {
      return (
        emp.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.role?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (emp.seat_id && emp.seat_id.toString().toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (emp.employeeid && emp.employeeid.toString().toLowerCase().includes(this.searchQuery.toLowerCase())) // Fix for emp_id
      );
    });
  
    // console.log("Filtered Employees: ", filtered); 
  
    if (this.searchQuery.trim().length > 0) {
      this.currentPage = 1;
    }
  
    let startIndex = (this.currentPage - 1) * this.itemsPerPage;
    let result = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  
    // console.log("Paginated Data After Filtering: ", result); // Debugging line
  
    return result;
  }
  

  setMenu(menu: string) {
    this.selectedMenu = menu;
    this.selectedSubMenu = ''; 
  }

  setSubMenu(menu: string) {
    this.selectedSubMenu = menu;
  }

  generateReport(): void {
    if (!this.employees || this.employees.length === 0) {
      alert("No employee data available for generating the report.");
      return;
    }

    const doc = new jsPDF();
    const currentDate = new Date().toISOString().slice(0, 10);
    const fileName = `Seating_Report_${currentDate}.pdf`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 116, 166);
    doc.text("Seating Allocation Report", 50, 20);

    doc.setDrawColor(0, 0, 0);
    doc.line(10, 25, 200, 25);

    const tableData = this.employees.map(emp => [
      emp.employeeid,
      emp.name,
      emp.department,
      emp.role,
      emp.seat_id !== null ? emp.seat_id : 'Unassigned'
    ]);

    autoTable(doc, {
      startY: 30,
      theme: "grid",
      head: [["Employee ID", "Name", "Department", "Role", "Seat No"]],
      body: tableData,
      headStyles: { fillColor: [40, 116, 166] }
    });

    doc.save(fileName);
  }

  fetchEmployees() {
    this.employeeService.getEmployees().subscribe(
      (data: any[]) => {
        // console.log('API Response:', data);
  
        this.employees = data.map(emp => ({
          employeeid: emp.id, // Ensure employee ID is correctly mapped
          name: emp.name,
          department: emp.department,
          role: emp.role,
          seat_id: emp.seatId !== undefined && emp.seatId !== null ? emp.seatId.toString() : 'Unassigned'
        }));
  
        // console.log('Processed Employees:', this.employees);
      },
      (error) => {
        console.error('Error fetching employees', error);
      }
    );
  }
  
  addEmployee() {
    // console.log("Sending Employee Data:", this.newEmployee); // ✅ Debugging
    this.employeeService.addEmployee(this.newEmployee).subscribe(
      () => {
        this.fetchEmployees();
        this.showModal = false;
        alert("Employee added successfully!");
      },
      (error) => {
        console.error('Failed to add employee:', error); // ✅ Log error response
        alert('Failed to add employee: ' + error.message);
      }
    );
  }
  

  editEmployee(employee: Employee) {
    this.selectedEmployee = { ...employee };
    this.showEditModal = true;
  }

  updateSeat() {
    if (!this.selectedEmployee) return;
  
    console.log("Updating Employee:", this.selectedEmployee); // Debugging
  
    this.employeeService.updateEmployee(this.selectedEmployee.employeeid, this.selectedEmployee)
      .subscribe(
        (response) => {
          alert("Update Success");
          console.log("Update Success:", response);
          this.fetchEmployees();
          this.showEditModal = false;
        },
        (error) => {
          console.error("Error updating employee", error);
          alert("Failed to update employee: " + error.message);
        }
      );
  }
  

  removeEmployee(id: number) {
    const employeeToDelete = this.employees.find(emp => emp.employeeid === id);
    if (!employeeToDelete) {
      alert("Employee not found!");
      return;
    }
  
    const confirmation = confirm(`Are you sure you want to delete '${employeeToDelete.name}' (ID: ${id})?`);
    if (!confirmation) {
      return;
    }
  
    this.employeeService.deleteEmployee(id).subscribe(
      (response: any) => {
        this.fetchEmployees();
        alert(`Employee '${employeeToDelete.name}' (ID: ${id}) deleted successfully.`);
      },
      (error) => {
        console.error('Error removing employee', error);
        alert('Failed to delete employee: ' + error.message);
      }
    );
  }
  
  

  totalPages() {
    return Math.max(1, Math.ceil(this.employees.length / this.itemsPerPage));
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
