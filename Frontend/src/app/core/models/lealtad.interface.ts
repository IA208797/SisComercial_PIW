export interface ITransaccionFrontend {
  _id?: string; // MongoDB autogenera un string _id para los subdocumentos
  pedido_id?: string;
  tipo: 'Acumulacion' | 'Canje';
  puntos_involucrados: number;
  descripcion: string;
  fecha: Date | string;
}

export interface ILealtadFrontend {
  _id: string; // El ID del documento principal
  cliente_id: string;
  puntos_acumulados: number;
  total_visitas: number;
  nivel_actual: string;
  historial_transacciones: ITransaccionFrontend[];
  fecha_ultima_actualizacion: Date | string;
}