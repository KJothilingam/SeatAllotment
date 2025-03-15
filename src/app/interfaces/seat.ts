import { SeatStatus } from "../enum/seatstatus";
import { Employee } from "./employee";

export interface Seat {
    id: string;
    status: SeatStatus; // Changed to camelCase
    employee_id: number; // Made optional (if some seats don't have employees)
}
