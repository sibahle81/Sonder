import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'html-viewer',
  templateUrl: './html-viewer.component.html',
  styleUrls: ['./html-viewer.component.css']
})
export class HtmlViewerComponent implements OnChanges {

  @Input() html: string;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  parsedHtml: SafeHtml;

  constructor(
    private readonly sanitizer: DomSanitizer
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.html) {
      this.isLoading$.next(true);
      this.parseHtml();
    }
  }

  parseHtml() {
      this.parsedHtml = this.sanitizer.bypassSecurityTrustHtml(this.html);
      this.isLoading$.next(false);
  }
}
