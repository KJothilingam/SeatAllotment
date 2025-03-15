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
        console.log('Processed Employees:', this.employees);
      },
      (error) => console.error('Error fetching employee data:', error)
    );
  }
  
  
  

  // loadSeats(): void {
  //   this.seatService.getSeats().subscribe(
  //     (data) => {
  //       this.seats = data.reduce((acc, seat) => {
  //         acc[seat.id] = {
  //           ...seat,
  //           id: seat.id.toString(),
  //           status: this.mapSeatStatus(seat.status) // ✅ Fetching status dynamically
  //         };
  //         return acc;
  //       }, {} as Record<string, Seat>);
  //     },
  //     (error) => console.error('Error fetching seat data:', error)
  //   );
  // }
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
        console.log('Processed Seats:', this.seats);  // ✅ Debugging
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

  // onSeatClick(seatId: string) {
  //   this.seatService.getEmployeeBySeat(seatId).subscribe(
  //     (emp) => {
  //       this.selectedEmployee = emp;
  //       this.showPopup = true;
  //       console.log('Employee Details:', this.selectedEmployee);
  //     },
  //     (error) => {
  //       console.error('Error fetching employee:', error);
  //       this.selectedEmployee = null;
  //       this.showPopup = false;
  //     }
  //   );
  // }
  onSeatClick(seatId: string) {
    console.log('Clicked Seat ID:', seatId);
  
    if (!seatId || !this.seats[seatId]) {
      console.error(`Invalid Seat ID: ${seatId}. Seat not found in seat records.`);
      return;
    }
  
    this.seatService.getEmployeeBySeat(seatId).subscribe(
      (emp) => {
        console.log(`Response for Seat ID ${seatId}:`, emp);
  
        if (!emp || Object.keys(emp).length === 0) {
          console.log(`No employee assigned to Seat ID ${seatId}`);
          this.selectedEmployee = null;
          this.showPopup = false;
          return;
        }
  
        // 🔥 Correctly mapping the response fields
        this.selectedEmployee = {
          employeeid: emp.employeeid ?? -1, // Default to -1 if missing
          seat_id: emp.seat_id ? Number(emp.seat_id) : -1, // Ensure seatId is a number
          name: emp.name || 'Unknown',
          role: emp.role || 'Not Assigned',
          department: emp.department || 'Not Available'
        };
  
        this.showPopup = true;
        console.log('Updated Employee Details:', this.selectedEmployee);
      },
      (error) => {
        console.error('Error fetching employee:', error);
        this.selectedEmployee = null;
        this.showPopup = false;
      }
    );
  }
  
  
  

  closePopup() {
    this.showPopup = false;
  }
}
