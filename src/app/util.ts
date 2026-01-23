import { AbstractControl, ControlConfig, FormControl } from '@angular/forms'

export type ControlConfigs<T> = {
  [K in keyof T]: T[K] | ControlConfig<T[K]> | AbstractControl<T[K]>
}

export type WithFormControls<T> = {
  [K in keyof T]: FormControl<T[K]>
}
