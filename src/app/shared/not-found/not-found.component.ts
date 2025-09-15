import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div class="flex-center" style="height: 85vh">
      <div class="text-center">
        <p style="font-size: 50px">Not Found</p>
        <div>
          <a href="" class="btn btn-outline-primary">Home</a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {
}
