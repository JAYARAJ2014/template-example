import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Customer } from './customer';

function ratingRange(c: AbstractControl): { [key: string]: boolean } | null {
  if (c.value !== null && (isNaN(c.value) || c.value < 1 || c.value > 5)) {
    return { range: true };
  }
  return null;
}
function comareEmailsValidator(
  c: AbstractControl
): { [key: string]: boolean } | null {
  let emailControl = c.get('email');
  let emailConfirmControl = c.get('confirmEmail');

  if (emailControl.pristine || emailConfirmControl.pristine) {
    return null;
  }
  if (emailControl.value === emailConfirmControl.value) {
    return null;
  }
  return { match: true };
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.customerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        emailGroup: this.formBuilder.group({
          email: ['', [Validators.required, Validators.email]],
          confirmEmail: ['', Validators.required]
        }, { validator: comareEmailsValidator }),

        phone: '',
        notification: 'email',
        rating: [null, ratingRange],
        sendCatalog: true
      }
    );
  }
  populateTestData(): void {
    this.customerForm.setValue({
      firstName: '',
      lastName: 'Daniels',
      email: 'jack.daniels@whiskey.com',
      sendCatalog: true
    });
  }
  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }
}
