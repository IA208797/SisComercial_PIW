import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectorRef} from "@angular/core";
import { PedidoService } from "../../../services/pedido.service";
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'mis-Pedidos', 
    imports: [CommonModule], 
    templateUrl: './revisarEstadoPedido.page.html'
})

export class MisPedidosComponent implements OnInit, OnDestroy {
  public listaPedidos: any[] = [];
  
  public tieneSesionActiva: boolean = false;
  public clienteLogueadoId: string = '';

  
  private subscripcionIntervalo!: Subscription; 

  constructor(
    private readonly pedidoService: PedidoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.verificarSesionUsuario();
  }

  
  ngOnDestroy(): void {
    if (this.subscripcionIntervalo) {
      this.subscripcionIntervalo.unsubscribe();
    }
  }

  private verificarSesionUsuario(): void {
    /////Cuando sepa como se optiene el usuario se pone aqui
    const tokenSimulado = 'UsuariodePrueba';

    if (tokenSimulado) {
      this.tieneSesionActiva = true;
      this.clienteLogueadoId = 'UsuariodePrueba'; 
      
      
      this.cargarHistorial();

      
      this.subscripcionIntervalo = interval(5000).subscribe(() => {
        this.cargarHistorial();
      });

    } else {
      this.tieneSesionActiva = false;
      this.clienteLogueadoId = '';
      this.listaPedidos = [];
    }
  }

  public cargarHistorial(): void {
    this.pedidoService.obtenerPedidosUsuario(this.clienteLogueadoId).subscribe({
      next: (response) => {
        if (response.success) {
          // Asignamos la información fresca
          this.listaPedidos = response.data;
        
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error('Error al cargar historial del usuario:', err)
    });
  }
}