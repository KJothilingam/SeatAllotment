import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SeatStatus } from '../../enum/seatstatus';

@Component({
  selector: 'app-seat',
  templateUrl: './seat.component.html',
  styleUrl: './seat.component.css'
})
export class SeatComponent {
  @Input() seatId!: string | number; // Accepts string or number
  @Input() seatstatus: SeatStatus = SeatStatus.Vacant; 
  @Input() size: number = 40;  
  @Input() direction: 'up' | 'down' | 'left' | 'right' = 'up'; 
  @Output() buttonClick = new EventEmitter<string>(); // Emit as string

  get bgColor(): string {
    switch (this.seatstatus) {
      case SeatStatus.Occupied: return '#33FF57';  
      case SeatStatus.Vacant: return  '#FF5733';    
      case SeatStatus.Reserved: return '#3357FF';  
      default: return '#CBCBCB';                  
    }
  }

  get arrowTransform(): string {
    switch (this.direction) {
      case 'up': return 'translate(5, 4) rotate(0, 10, 10)';
      case 'right': return 'translate(15, 4) rotate(90, 10, 10)';
      case 'down': return 'translate(14, 15) rotate(180, 10, 10)';
      case 'left': return 'translate(3, 13) rotate(-90, 10, 10)';
      default: return 'translate(5, 4) rotate(0, 10, 10)';
    }
  }

  onClick() {
    console.log("Seat clicked:", this.seatId);
    this.buttonClick.emit(this.seatId.toString()); // Emit as string
    alert('Seat clicked: ' + this.seatId);
  }
}
