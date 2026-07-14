import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CarritoService } from '../../../services/carrito.service';

@Component({
    selector: 'app-Carrito',
    templateUrl: './carrito.component.html'
})
export class CarritoComponent implements OnInit {
    public totalArticulos: number = 0;

    constructor(
        private carritoService: CarritoService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.carritoService.carrito$.subscribe(items => {
            this.totalArticulos = items.reduce((total, item) => total + item.cantidad, 0);
            this.cdr.detectChanges();
        });
    }
}