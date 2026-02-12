// src/app/app.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, ToastComponent // This is the placeholder for your routes
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // The component is now just a simple shell.
  // All the logic is in the pages (like the login component).
}