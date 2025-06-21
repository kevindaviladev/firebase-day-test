import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.html',
  styleUrls: ['./registration.css']
})
export class RegistrationComponent {
  deviceName: string = '';

  constructor(private firestore: Firestore) {}

  async registerDevice() {
    if (this.deviceName) {
      try {
        await addDoc(collection(this.firestore, 'lotteryParticipants'), {
          deviceName: this.deviceName,
          registeredAt: new Date(),
          winner: false
        });
        this.deviceName = '';
        alert('Device registered successfully!');
      } catch (e) {
        console.error('Error adding document: ', e);
        alert('Error registering device.');
      }
    } else {
      alert('Please enter a device name.');
    }
  }
}
