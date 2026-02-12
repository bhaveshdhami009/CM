import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripStatusPrefix',
  standalone: true   // <-- important for standalone setup
})
export class StripStatusPrefixPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value
      .replace(/pending:\s*/i, '')
      .replace(/done:\s*/i, '')
      .replace(/next:\s*/i, '');
  }
}
