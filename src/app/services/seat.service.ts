import { map, catchError } from 'rxjs/operators';  // ✅ Import missing operators
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';  // ✅ Import 'of' from 'rxjs'
import { Seat } from '../interfaces/seat';
import { Employee } from '../interfaces/employee';


  @Injectable({
    providedIn: 'root'
  })
  export class SeatService {
    private apiUrl = 'http://localhost:8080/seats';
  private employeeUrl = 'http://localhost:8080/employees'; 

    constructor(private http: HttpClient) {}

    getSeatById(seatId: string): Observable<Seat> {
      return this.http.get<Seat>(`${this.apiUrl}/${seatId}`);
    }

    getSeats(): Observable<Seat[]> {
      return this.http.get<Seat[]>(this.apiUrl);
    }

    // Fetch seat by ID (including employee details)
    //   getEmployeeBySeat(seatId: string): Observable<Employee> {
    //   return this.http.get<Employee>(`${this.apiUrl}/${encodeURIComponent(seatId)}/employee-details`);
    // }
    getEmployeeBySeat(seatId: string): Observable<Employee | { seatId: string; status: string; message: string } | null> {
      return this.http.get<Employee | any>(`${this.apiUrl}/${encodeURIComponent(seatId)}/employee-details`).pipe(
        map((response: any) => {
          if (response.status === "VACANT") {
            return response;  // Return the full response instead of null
          }
          return response; // Return employee data if present
        }),
        catchError((error: any) => {
          console.error("Error fetching employee details:", error);
          return of(null); // Handle errors gracefully
        })
      );
    }
    
    
    
     // ✅ Fetch employee details using employee ID (Long)
  getEmployeeById(employeeId: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.employeeUrl}/${employeeId}`);
  }
    
    
  }
