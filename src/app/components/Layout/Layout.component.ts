import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatComponent } from "../seat/seat.component";
import { SeatService } from '../../services/seat.service';
import { EmployeeService } from '../../services/employee.service';
import { SeatStatus } from '../../enum/seatstatus';
import { Employee } from '../../interfaces/employee';
import { Seat } from '../../interfaces/seat';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-Layout',
  standalone: true,
  imports: [SeatComponent, CommonModule,NavbarComponent],
  templateUrl: './Layout.component.html',
  styleUrl: './Layout.component.css'
})
export class LayoutComponent implements OnInit {
  SeatStatus = SeatStatus;
  selectedEmployee: Employee | null = null;
  showPopup = false;
  seats: Record<string, Seat> = {};  // ✅ Store seats as an object for quick access
  employees: Record<string, Employee> = {}; 

  constructor(private seatService: SeatService, private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadSeats();
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe(
      (data) => {
        this.employees = data.reduce((acc, emp) => {
          acc[emp.employeeid] = {
            ...emp,
            seat_id: emp.seat_id ? emp.seat_id.toString() : 'Unassigned' // Ensure it's a string
          };
          return acc;
        }, {} as Record<string, Employee>);
        // console.log('Processed Employees:', this.employees);
      },
      (error) => console.error('Error fetching employee data:', error)
    );
  }
  
  
  

  loadSeats(): void {
    this.seatService.getSeats().subscribe(
      (data) => {
        this.seats = data.reduce((acc, seat) => {
          acc[seat.id] = {
            ...seat,
            id: seat.id.toString(),  // Convert ID to string for consistency
            status: this.mapSeatStatus(seat.status)
          };
          return acc;
        }, {} as Record<string, Seat>);
        // console.log('Processed Seats:', this.seats);  // ✅ Debugging
      },
      (error) => console.error('Error fetching seat data:', error)
    );
  }
  

  mapSeatStatus(status: string): SeatStatus {
    switch (status.toUpperCase()) {
      case 'OCCUPIED': return SeatStatus.Occupied;
      case 'VACANT': return SeatStatus.Vacant;
      case 'RESERVED': return SeatStatus.Reserved;
      default: return SeatStatus.Vacant;
    }
  }
      onSeatClick(seatId: string) {
        console.log('Clicked Seat ID:', seatId);

        this.seatService.getEmployeeBySeat(seatId).subscribe(
          (response: any) => {  
            console.log('API Response:', response);

            if (response && response.employeeName) {  
              this.selectedEmployee = {
                employeeid: response.employeeId || null,  // ✅ Use employeeId if available
                name: response.employeeName,             // ✅ Correctly map to "name"
                role: response.role,
                department: response.department,
                seat_id: response.seatId                 // ✅ Correctly map to "seat_id"
              };
              this.showPopup = true;
            } else {
              this.selectedEmployee = null;
              this.showPopup = false;
              console.warn(`No employee assigned to seat ${seatId}`);
            }
          },
          (error) => {
            console.error('Error fetching employee details:', error);
            this.selectedEmployee = null;
            this.showPopup = false;
          }
        );
    }

      
  
  
  
  
  
  

  closePopup() {
    this.showPopup = false;
  }
}
