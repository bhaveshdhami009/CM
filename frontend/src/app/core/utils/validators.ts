import { Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

// Regex Patterns (Matched with Backend DTOs)
export const PATTERNS = {
  // Mobile: 10 digits starting with 6-9
  MOBILE: /^[6-9]\d{9}$/, 
  
  // Pincode: Exactly 6 digits
  PINCODE: /^[0-9]{6}$/,
  
  // Email: Standard Angular validator usually suffices, but here is a stricter one if needed
  EMAIL: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
  
  // Setting Key: lowercase snake_case
  SNAKE_CASE: /^[a-z0-9_]+$/
};

export class AppValidators {
  
  // --- Standard Wrappers ---
  
  static required = Validators.required;
  
  static email = [Validators.email];
  
  static mobile = [Validators.pattern(PATTERNS.MOBILE)];
  
  static pincode = [Validators.pattern(PATTERNS.PINCODE)];
  
  static snakeCase = [Validators.pattern(PATTERNS.SNAKE_CASE)];

  // --- Custom Validators ---

  /**
   * Cross-Field Validator: Ensures an ID isn't in both arrays.
   * Usage: formBuilder.group({ ... }, { validators: AppValidators.noDuplicateArrays('petitionerIds', 'respondentIds') })
   */
  static noDuplicateArrays(fieldA: string, fieldB: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const valA = form.get(fieldA)?.value;
      const valB = form.get(fieldB)?.value;

      if (Array.isArray(valA) && Array.isArray(valB)) {
        const setA = new Set(valA);
        for (const item of valB) {
          if (setA.has(item)) {
            // Return error on the GROUP level
            return { duplicateParty: true };
          }
        }
      }
      return null;
    };
  }

  /**
   * Conditional Validator: Field is required only if another field has a specific value
   */
  static requiredIf(triggerField: string, expectedValue: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      
      const triggerValue = control.parent.get(triggerField)?.value;
      
      if (triggerValue === expectedValue && !control.value) {
        return { required: true };
      }
      return null;
    };
  }
}