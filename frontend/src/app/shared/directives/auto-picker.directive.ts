import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[type=date], input[type=datetime-local]' // applies to all date/datetime inputs
})
export class AutoPickerDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('click')
  @HostListener('focus')
  openPicker() {
    const input = this.el.nativeElement;
    try {
      input.showPicker();   // modern browsers
    } catch {
      input.click();        // fallback for older browsers
    }
  }
}
