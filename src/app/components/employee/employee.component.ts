import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FilterPipePipe } from '../../filter-pipe.pipe';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../interfaces/employee';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private http = inject(HttpClient);

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.fetchEmployees();
  }

  get paginatedEmployees() {
    let filtered = this.employees.filter(emp => {
      return (
        emp.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.role?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (emp.seat_id && emp.seat_id.toString().toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (emp.employeeid && emp.employeeid.toString().toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    });

    if (this.searchQuery.trim().length > 0) {
      this.currentPage = 1;
    }

    let startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  setMenu(menu: string) {
    this.selectedMenu = menu;
    this.selectedSubMenu = '';
  }

  setSubMenu(menu: string) {
    this.selectedSubMenu = menu;
  }

  // generateReport(): void {
  //   if (!this.employees || this.employees.length === 0) {
  //     alert("No employee data available for generating the report.");
  //     return;
  //   }

  //   const doc = new jsPDF();
  //   const currentDate = new Date().toISOString().slice(0, 10);
  //   const fileName = `Seating_Report_${currentDate}.pdf`;

  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(18);
  //   doc.setTextColor(40, 116, 166);
  //   doc.text("Seating Allocation Report", 50, 20);

  //   doc.setDrawColor(0, 0, 0);
  //   doc.line(10, 25, 200, 25);

  //   const tableData = this.employees.map(emp => [
  //     emp.employeeid,
  //     emp.name,
  //     emp.department,
  //     emp.role,
  //     emp.seat_id !== null ? emp.seat_id : 'Unassigned'
  //   ]);

  //   autoTable(doc, {
  //     startY: 30,
  //     theme: "grid",
  //     head: [["Employee ID", "Name", "Department", "Role", "Seat No"]],
  //     body: tableData,
  //     headStyles: { fillColor: [40, 116, 166] }
  //   });

  //   doc.save(fileName);
  // }

  generateReport(): void {
    if (!this.employees || this.employees.length === 0) {
        alert("No employee data available for generating the report.");
        return;
    }

    const doc = new jsPDF();
    const currentDate = new Date().toISOString().slice(0, 10);
    const fileName = `Seating_Report_${currentDate}.pdf`;

    const headerImg = new Image();
    headerImg.src = "assets/header.png"; // Ensure this path is correct

    const footerImg = new Image();
    footerImg.src = "assets/footer.png"; // Ensure this path is correct

    headerImg.onload = () => {
        doc.addImage(headerImg, "PNG", 10, 5, 190, 20); // Adjust position & size

        // Report Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(40, 116, 166);
        doc.text("Seating Allocation Report", 70, 35);

        doc.setDrawColor(0, 0, 0);
        doc.line(10, 40, 200, 40);

        // Table Data
        const tableData = this.employees.map(emp => [
            emp.employeeid, emp.name, emp.department, emp.role, emp.seat_id
        ]);

        autoTable(doc, {
            startY: 45,
            theme: "grid",
            head: [["Employee ID", "Name", "Department", "Role", "Seat No"]],
            body: tableData,
            headStyles: { fillColor: [40, 116, 166] }
        });

        footerImg.onload = () => {
            doc.addImage(footerImg, "PNG", 10, 270, 190, 20); // Adjust position & size
            doc.save(fileName); // ✅ Ensure the PDF saves after everything loads
        };

        footerImg.src = "assets/footer.png"; // Trigger loading
    };

    headerImg.src = "assets/header.png"; // Trigger loading
}

  fetchEmployees() {
    this.employeeService.getEmployees().subscribe(
      (data: any[]) => {
        this.employees = data.map(emp => ({
          employeeid: emp.id,
          name: emp.name,
          department: emp.department,
          role: emp.role,
          seat_id: emp.seatId !== undefined && emp.seatId !== null ? emp.seatId.toString() : 'Unassigned'
        }));
      },
      (error) => {
        console.error('Error fetching employees', error);
      }
    );
  }


addEmployee() {
  let seatSelection = this.newEmployee.seat_id 
      ? String(this.newEmployee.seat_id).trim() 
      : '';

  if (seatSelection === 'Work From Home') {
      this.newEmployee.seat_id = 'Work From Home';
  } else if (seatSelection === 'Manual' && this.manualNewSeatEntry?.trim()) {
      this.newEmployee.seat_id = this.manualNewSeatEntry;
  } else {
      this.newEmployee.seat_id = 'Unassigned'; // Default to Unassigned
  }

  console.log("🚀 Sending Employee Data:", this.newEmployee);

  this.employeeService.addEmployee(this.newEmployee).subscribe(
      (response: any) => {
          console.log("✅ Response from backend:", response);
          if (response.message.includes('❌')) {
              alert(response.message); // Show error if seat is occupied
              return;
          }
          
          this.fetchEmployees();
          this.showModal = false;
          alert(response.message || "✅ Employee added successfully!");

          // Reset form
          this.newEmployee = { employeeid: 0, name: '', department: '', role: '', seat_id: 'Unassigned' };
          this.manualNewSeatEntry = '';
      },
      (error) => {
          console.error('❌ Failed to add employee:', error);
          alert('❌ Error: ' + (error.error?.message || 'Something went wrong!'));
      }
  );
}



  editEmployee(employee: Employee) {
    this.selectedEmployee = { ...employee };
    this.showEditModal = true;
  }

  manualSeatEntry: string = ''; 
  handleSeatSelection() {
    if (this.selectedEmployee.seat_id !== 'Manual') {
      this.manualSeatEntry = ''; 
    }
  }

  manualNewSeatEntry: string = ''; 
  handleNewSeatSelection() {
    if (this.newEmployee.seat_id === 'Manual') {
        this.manualNewSeatEntry = '';
    } else {
        this.manualNewSeatEntry = ''; // Reset manual entry if another option is selected
    }
}


  updateSeat() {
    if (!this.selectedEmployee || !this.selectedEmployee.employeeid) {
        console.error("Error: Employee details are missing!");
        return;
    }

    let seatIdToUpdate = this.selectedEmployee.seat_id;
    
    if (this.selectedEmployee.seat_id === 'Manual' && this.manualSeatEntry.trim() !== '') {
        seatIdToUpdate = this.manualSeatEntry;
    }

    const updatedEmployee = {
        name: this.selectedEmployee.name?.trim() || "",
        department: this.selectedEmployee.department?.trim() || "",
        role: this.selectedEmployee.role?.trim() || "",
        seatId: seatIdToUpdate ? seatIdToUpdate : "Unassigned"
    };

    const headers = new HttpHeaders({ "Content-Type": "application/json" });

    this.http.put(`http://localhost:8080/employees/update/${this.selectedEmployee.employeeid}`, updatedEmployee, { headers })
        .subscribe({
            next: (res: any) => {
                console.log("✅ Employee updated successfully:", res);
                alert(res.message || "Update successful!");
                this.fetchEmployees();
                this.showEditModal = false;
            },
            error: (err) => {
                console.error("❌ API Error:", err);
                alert(err.error?.message || "Failed to update employee. Please try again.");
            }
        });
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
      () => {
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
