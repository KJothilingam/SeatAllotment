import { Seat } from "./seat";
export interface Employee {
  employeeid: number;
  name: string;
  role: string;
  department: string;
  seat_id: string | number | null; // ✅ seat_id can be string, number, or null
}
