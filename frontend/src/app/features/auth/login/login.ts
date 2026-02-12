import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { LoginDto } from '../../../shared/models/dtos'; // Import DTO

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink 
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  credentials: LoginDto = {
    email: '',
    password: ''
  };
  rememberMe = false;
  errorMessage = '';
  isLoading = false; 

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials, this.rememberMe).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }
}