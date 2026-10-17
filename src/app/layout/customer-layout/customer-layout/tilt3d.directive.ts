import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/** Har `.b3d` button par cursor-tilt + moving sheen effect lagata hai. */
@Directive({ selector: '.b3d', standalone: true })
export class Tilt3dDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly calm =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  @HostListener('pointermove', ['$event'])
  move(e: PointerEvent): void {
    if (this.calm || e.pointerType === 'touch') return;
    const r = this.el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const st = this.el.style;
    st.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
    st.setProperty('--rx', ((0.5 - y) * 14).toFixed(2) + 'deg');
    st.setProperty('--mx', (x * 100).toFixed(1) + '%');
    st.setProperty('--my', (y * 100).toFixed(1) + '%');
  }

  @HostListener('pointerleave')
  leave(): void {
    this.el.style.setProperty('--rx', '0deg');
    this.el.style.setProperty('--ry', '0deg');
  }
}
