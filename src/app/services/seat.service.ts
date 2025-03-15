  import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { Seat } from '../interfaces/seat';
  import { Employee } from '../interfaces/employee';

  @Injectable({
    providedIn: 'root'
  })
  export class SeatService {
    private apiUrl = 'http://localhost:8080/seats';

    constructor(private http: HttpClient) {}

    getSeatById(seatId: string): Observable<Seat> {
      return this.http.get<Seat>(`${this.apiUrl}/${seatId}`);
    }

    getSeats(): Observable<Seat[]> {
      return this.http.get<Seat[]>(this.apiUrl);
    }

    // Fetch seat by ID (including employee details)
    getEmployeeBySeat(seatId: string): Observable<Employee> {
      return this.http.get<Employee>(`${this.apiUrl}/${encodeURIComponent(seatId)}/employee-details`);
    }
    
    
    
  }
