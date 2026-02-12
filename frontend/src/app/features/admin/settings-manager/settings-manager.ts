import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { SettingService } from '../../../core/services/setting';
import { SettingDto } from '../../../shared/models/dtos';
import { AppValidators } from '../../../core/utils/validators';

function jsonValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null; 
  try {
    JSON.parse(control.value);
    return null; 
  } catch (e) {
    return { invalidJson: true }; 
  }
}

@Component({
  selector: 'app-settings-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-manager.html',
  styleUrl: './settings-manager.scss'
})
export class SettingsManagerComponent implements OnInit {
  settingsList: SettingDto[] = [];
  isLoading = false;
  showModal = false;
  isEditMode = false;

  settingForm: FormGroup;

  constructor(
    private settingService: SettingService,
    private fb: FormBuilder
  ) {
    this.settingForm = this.fb.group({
      // Use centralized Snake Case validator
      key: ['', [AppValidators.required, ...AppValidators.snakeCase]],
      description: [''],
      valueString: ['[]', [AppValidators.required, jsonValidator]] 
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.settingService.getAllSettings().subscribe({
      next: (data) => {
        this.settingsList = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.settingForm.reset({
      key: '',
      description: '',
      valueString: '[\n  "Option 1",\n  "Option 2"\n]'
    });
    this.settingForm.get('key')?.enable(); 
    this.showModal = true;
  }

  openEditModal(item: SettingDto) {
    this.isEditMode = true;
    this.settingForm.patchValue({
      key: item.key,
      description: item.description,
      valueString: JSON.stringify(item.value, null, 2)
    });
    this.settingForm.get('key')?.disable(); 
    this.showModal = true;
  }

  save() {
    if (this.settingForm.invalid) {
      this.settingForm.markAllAsTouched();
      return;
    }

    const formData = this.settingForm.getRawValue(); 
    
    const payload = {
      key: formData.key,
      description: formData.description,
      value: JSON.parse(formData.valueString)
    };

    const request$ = this.isEditMode
      ? this.settingService.updateSetting(payload.key, payload)
      : this.settingService.createSetting(payload);

    request$.subscribe({
      next: () => {
        this.showModal = false;
        this.loadSettings();
      },
      error: (err) => alert(err.error?.message || 'Save failed')
    });
  }
}