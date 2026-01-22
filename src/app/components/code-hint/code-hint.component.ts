import { Component, input } from '@angular/core'

@Component({
  selector: 'app-code-hint',
  imports: [],
  templateUrl: './code-hint.component.html',
  styleUrl: './code-hint.component.scss',
  standalone: true,
})
export class CodeHintComponent {
  readonly msg = input.required<string>()
}
