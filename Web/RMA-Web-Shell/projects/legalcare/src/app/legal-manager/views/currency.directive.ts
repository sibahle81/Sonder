import { Directive, ElementRef, HostListener } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[decimal-mask]"
})
export class DecimalMask {
  constructor(private el: ElementRef, public model: NgControl) {}

  @HostListener("input", ["$event"]) onEvent($event) {
    const inputElement = this.el.nativeElement;
    const currentValue = this.model.control.value;
    const cursorStart = inputElement.selectionStart;
    const cursorEnd = inputElement.selectionEnd;

    const valArray = inputElement.value.split(".");
    let newVal = "";

    for (let i = 0; i < valArray.length; ++i) {
      valArray[i] = valArray[i].replace(/\D/g, "");
    }

    if (valArray.length === 0) {
      newVal = "";
    } else {
      let matches = valArray[0].match(/[0-9]{3}/gim);

      if (matches !== null && valArray[0].length > 3) {
        let commaGroups = Array.from(
          Array.from(valArray[0])
            .reverse()
            .join("")
            .match(/[0-9]{3}/gim)
            .join("")
        )
          .reverse()
          .join("");
        let replacement = valArray[0].replace(
          commaGroups.replace(/\D/g, ""),
          ""
        );

        newVal =
          (replacement.length > 0 ? replacement + "," : "") + commaGroups;
      } else {
        newVal = valArray[0] === "0" ? "" : valArray[0];
      }

      if (valArray.length > 1) {
        newVal +=
          valArray[1].substring(0, 2) !== "00"
            ? "." + valArray[1].substring(0, 2)
            : "";
      }
    }
    this.model.control.setValue(newVal, { emitEvent: false });
    let newCursorPos = cursorEnd + (newVal.length - currentValue.length);
    newCursorPos = Math.min(newCursorPos, inputElement.value.length);
    inputElement.setSelectionRange(newCursorPos, newCursorPos);
  }
}
