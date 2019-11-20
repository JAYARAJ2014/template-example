import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { debounceTime} from 'rxjs/operators';
import { Customer } from './customer';

/* Validator that allow rating only up to 1-5 */
function ratingRange(c: AbstractControl): { [key: string]: boolean } | null {
  if (c.value !== null && (isNaN(c.value) || c.value < 1 || c.value > 5)) {
    return { range: true };
  }
  return null;
}
/** Validator that compares two email address fields */
function compareEmailsValidator(
  c: AbstractControl
): { [key: string]: boolean } | null {
  const emailControl = c.get('email');
  const emailConfirmControl = c.get('confirmEmail');

  if (
    emailControl.pristine ||
    emailConfirmControl.pristine ||
    emailControl.value === emailConfirmControl.value
  ) {
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
  emailMessage: string;

  private validationMessages = {
    required: 'Please enter your email address',
    email: 'Please enter a valid email address'
  };

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.customerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.formBuilder.group(
        {
          email: ['', [Validators.required, Validators.email]],
          confirmEmail: ['', Validators.required]
        },
        { validator: compareEmailsValidator }
      ),

      phone: '',
      notification: 'email',
      rating: [null, ratingRange],
      sendCatalog: true
    });

    this.customerForm
      .get('notification')
      .valueChanges.subscribe(value => this.setNotification(value));

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(debounceTime(1000)).subscribe(value => this.setMessage(emailControl));

    // const emailConfirmControl = this.customerForm.get('emailGroup.confirmEmail');

  }
  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors)
        .map(key => this.validationMessages[key])
        .join(' ');
    }
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
