import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, updateDoc, query, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface Participant {
  id?: string;
  deviceName: string;
  registeredAt: Date;
  winner: boolean;
}

@Component({
  selector: 'app-lottery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lottery.html',
})
export class LotteryComponent {
  participants$: Observable<Participant[]>;
  lotteryStatus: string = 'Ready to draw!';
  winnerName: string | null = null;
  isLotteryRunning: boolean = false;
  myDeviceId: string = ''; // This would ideally come from a local storage or a session
  myResult: string | null = null;

  constructor(private firestore: Firestore) {
    const participantsCollection = collection(this.firestore, 'lotteryParticipants');
    this.participants$ = collectionData(participantsCollection, { idField: 'id' }) as Observable<Participant[]>;

    // For demonstration, let's set a dummy device ID. In a real app, you'd identify the user/device.
    this.myDeviceId = localStorage.getItem('myDeviceId') || '';
    if (!this.myDeviceId) {
      this.myDeviceId = `device_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('myDeviceId', this.myDeviceId);
    }

    // Listen for real-time updates on winner status for the current device
    const q = query(collection(this.firestore, 'lotteryParticipants'), orderBy('registeredAt', 'desc'), limit(100)); // Adjust limit as needed
    collectionData(q, { idField: 'id' }).subscribe((participants: any) => {
      const myParticipant = participants.find((p: any) => p.deviceName === this.myDeviceId);
      if (myParticipant) {
        if (myParticipant.winner) {
          this.myResult = 'You win!';
        } else if (this.isLotteryRunning) {
          this.myResult = 'Sorry, you lose.';
        }
      }
    });
  }

  async runLottery() {
    this.isLotteryRunning = true;
    this.lotteryStatus = 'Drawing...';
    this.winnerName = null;
    this.myResult = null;

    const participants = await this.participants$.toPromise(); // Convert observable to promise to get current value

    if (!participants || participants.length === 0) {
      this.lotteryStatus = 'No participants registered yet.';
      this.isLotteryRunning = false;
      return;
    }

    // Reset previous winner if any
    for (const p of participants) {
      if (p.winner && p.id) {
        const participantDocRef = doc(this.firestore, 'lotteryParticipants', p.id);
        await updateDoc(participantDocRef, { winner: false });
      }
    }

    const winnerIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[winnerIndex];

    if (winner && winner.id) {
      const winnerDocRef = doc(this.firestore, 'lotteryParticipants', winner.id);
      await updateDoc(winnerDocRef, { winner: true });
      this.winnerName = winner.deviceName;
      this.lotteryStatus = `The winner is: ${this.winnerName}!`;
    } else {
      this.lotteryStatus = 'Could not determine a winner.';
    }
    this.isLotteryRunning = false;
  }

  // Helper to identify the current device
  identifyDevice(name: string) {
    this.myDeviceId = name;
    localStorage.setItem('myDeviceId', this.myDeviceId);
    alert(`This device is now identified as: ${this.myDeviceId}`);
  }
}
