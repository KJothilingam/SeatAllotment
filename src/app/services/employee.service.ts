import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Employee } from '../interfaces/employee';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/employees';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/list`).pipe(
      map((employees: Employee[]) =>
        employees.map(emp => ({
          ...emp,
          seatid: emp.seat_id  
        }))
      ),
      catchError(this.handleError)
    );
  }
  

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getEmployeeBySeat(seatId: string): Observable<Employee | null> {
    return this.http.get<Employee[]>(`${this.apiUrl}/list`).pipe(
      map((employees: Employee[]) => employees.find(emp => emp.seat_id === seatId) || null),
      catchError(this.handleError)
    );
  }


addEmployee(employee: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/create`, employee).pipe(
      catchError((error: HttpErrorResponse) => {
          console.error("❌ API Error:", error);
          alert("❌ Error: " + (error.error?.message || "Server Error"));
          return throwError(() => new Error(error.error?.message || "Server Error"));
      })
  );
}



  updateEmployee(id: number, employee: Employee): Observable<any> { 
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, employee).pipe(
      map((response) => response.employee), // Extract the actual employee object
      catchError((error: HttpErrorResponse) => {
        console.error("API Error:", error);
        return throwError(() => new Error(error.error?.message || "Update failed")); 
      })
    );
}

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(
      map(response => response), // Map response directly
      catchError(this.handleError)
    );
  }
  

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error('Something went wrong, please try again later.'));
  }

}
