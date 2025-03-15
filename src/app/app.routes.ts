import { Routes } from '@angular/router';

export const routes: Routes = [
    
    {
        path:'',
        loadComponent :()=>import('./components/Layout/Layout.component').then((c)=> c.LayoutComponent),
    },
    
  
  
    {
        path:'employee',
        loadComponent :()=>import('./components/employee/employee.component').then((c)=> c.EmployeeComponent),
    },
  
   
  
];
