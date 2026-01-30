import { Component, forwardRef, inject } from '@angular/core'
import {
  ControlValueAccessor,
  FormBuilder,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms'
import { StartupPopups } from '../../model/save-file.model'
import { MatButtonToggleModule } from '@angular/material/button-toggle'

@Component({
  selector: 'app-shown-popups-editor',
  imports: [MatButtonToggleModule, ReactiveFormsModule],
  templateUrl: './shown-popups-editor.component.html',
  styleUrl: './shown-popups-editor.component.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ShownPopupsEditorComponent),
      multi: true,
    },
  ],
})
export class ShownPopupsEditorComponent implements ControlValueAccessor {
  private readonly fb = inject(FormBuilder)

  protected readonly formControl = this.fb.nonNullable.control<number[]>([])

  private onChange: (value: any) => void = () => {}

  constructor() {
    this.formControl.valueChanges.subscribe(val =>
      this.onChange(val.reduce((flags, flag) => flags | flag, 0)),
    )
  }

  writeValue(obj: number) {
    this.formControl.setValue(this.startupPopups.map(p => p.value).filter(bit => (obj & bit) !== 0))
  }

  registerOnChange(fn: any) {
    this.onChange = fn
  }

  registerOnTouched(_fn: any) {}

  protected readonly startupPopups = Object.values(StartupPopups)
    .filter(v => typeof v !== 'string' && v !== 0)
    .map(v => ({
      value: v,
      name: StartupPopups[v],
    }))
}
