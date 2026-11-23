export type RolUsuario = 'ADMIN' | 'ENCARGADO';

export type EstadoAlerta =
  | 'VENCIDO'
  | 'POR_VENCER'
  | 'STOCK_CRITICO'
  | 'NORMAL'
  | 'INDETERMINADO';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stockMinimo: number | null;
  diasPreaviso: number | null;
}

export interface Lote {
  id: number;
  productoId: number;
  codigoLote: string;
  saldo: number;
  fechaVencimiento: string | null; // YYYY-MM-DD
}

export interface LoteConProducto extends Lote {
  productoCodigo: string;
  productoNombre: string;
  stockMinimo: number | null;
  diasPreaviso: number | null;
}

export interface AlertaLote {
  loteId: number;
  codigoLote: string;
  productoId: number;
  productoNombre: string;
  saldo: number;
  fechaVencimiento: string | null;
  diasRestantes: number | null;
  estado: EstadoAlerta;
}

export interface Movimiento {
  id: number;
  loteId: number;
  tipo: 'INGRESO' | 'VENTA' | 'MERMA';
  cantidad: number;
  motivo: string | null;
  usuarioRol: string;
  fecha: string;
}