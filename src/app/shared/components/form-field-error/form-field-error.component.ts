import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-error',
  template: `
    <p class="text-danger">
      {{errorMessage}}
    </p>
  `,
  styleUrls: ['./form-field-error.component.css']
})
export class FormFieldErrorComponent implements OnInit {

  @Input('form-control') formControl!: FormControl | any;

  constructor() { }

  ngOnInit(): void {
  }

  public get errorMessage(): string | null {
    if (this.mustShowErrorMessage()) {
      return this.showErrorMessage();
    }
    return null;
  }

  private mustShowErrorMessage(): boolean {
    return this.formControl.invalid && this.formControl.touched;
  }

  private showErrorMessage(): string | null {
    if (this.formControl.errors?.['required']) {
      return "Campo obrigatório";
    } else if (this.formControl.errors?.['minlength']) {
      const minLength = this.formControl.errors?.['minlength'].requiredLength;
      return `Deve ter no mínimo ${minLength} caracteres`;
    } else if (this.formControl.errors?.['email']) {
      return "formato de email inválido";
    }
    return null;
  }

}
