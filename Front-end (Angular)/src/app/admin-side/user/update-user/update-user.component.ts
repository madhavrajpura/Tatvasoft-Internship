import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { ToastrService } from 'ngx-toastr';
import { AdminloginService } from 'src/app/service/adminlogin.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  updateForm: FormGroup;
  formValid: boolean;
  userId: string; // Store the user ID
  updateData: any;

  constructor(
    public fb: FormBuilder,
    private service: AdminloginService,
    private toastr: ToastrService,
    public activateRoute: ActivatedRoute,
    private router: Router,
    public toast: NgToastService
  ) { }

  ngOnInit(): void {
    this.updateForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordCompareValidator // Apply the custom validator to the form group
    });

    console.log('Form Initialized:', this.updateForm); // Log form initialization

    // Extract user ID from route params
    this.userId = this.activateRoute.snapshot.paramMap.get('Id');
    if (this.userId) {
      // Call method to fetch user data by ID
      this.FetchDetail(this.userId);
    }
  }

  passwordCompareValidator(fc: AbstractControl): ValidationErrors | null {
    const password = fc.get('password')?.value;
    const confirmPassword = fc.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notmatched: true };
  }

  get firstName() {
    return this.updateForm.get('firstName') as FormControl;
  }

  get lastName() {
    return this.updateForm.get('lastName') as FormControl;
  }

  get phoneNumber() {
    return this.updateForm.get('phoneNumber') as FormControl;
  }

  get emailAddress() {
    return this.updateForm.get('emailAddress') as FormControl;
  }

  get password() {
    return this.updateForm.get('password') as FormControl;
  }

  get confirmPassword() {
    return this.updateForm.get('confirmPassword') as FormControl;
  }

  FetchDetail(id: any) {
    this.service.GetUserById(id).subscribe((data: any) => {
      this.updateData = data.data;
      this.updateForm.patchValue({
        id: this.updateData.id,
        firstName: this.updateData.firstName,
        lastName: this.updateData.lastName,
        phoneNumber: this.updateData.phoneNumber,
        emailAddress: this.updateData.emailAddress,
        password: this.updateData.password,
        confirmPassword: this.updateData.confirmPassword
      });
      console.log('Form Data Patched:', this.updateForm.value); // Log form data patching
    });
  }

  onSubmit() {
    this.formValid = true;
    if (this.updateForm.valid) {
      let updatedUserData = this.updateForm.value;
      console.log('Form Submitted:', updatedUserData); // Added log to check form submission
      this.service.UpdateUser(updatedUserData).subscribe((data: any) => {
        if (data.result === 1) {
          this.toast.success({ detail: "SUCCESS", summary: data.data, duration: 3000 });
          setTimeout(() => {
            this.router.navigate(['userPage']);
          }, 1000);
        } else {
          this.toastr.error(data.message);
        }
      }, err => {
        this.toast.error({ detail: "ERROR", summary: err.message, duration: 3000 });
        console.error('Update Error:', err); // Added log to check error
      });
      this.formValid = false;
    } else {
      console.warn('Form Invalid:', this.updateForm.errors); // Added log to check form validation errors
      console.log('Form Controls:', this.updateForm.controls); // Log form controls and their states
      Object.keys(this.updateForm.controls).forEach(key => {
        const controlErrors: ValidationErrors = this.updateForm.get(key)?.errors;
        if (controlErrors != null) {
          Object.keys(controlErrors).forEach(keyError => {
            console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
          });
        }
      });
    }
  }
}