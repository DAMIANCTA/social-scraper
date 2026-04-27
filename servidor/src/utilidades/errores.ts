type ParametrosErrorAplicacion = {
  codigo: string;
  mensaje: string;
  estadoHttp: number;
  detalles?: unknown;
};

export class ErrorAplicacion extends Error {
  readonly codigo: string;
  readonly estadoHttp: number;
  readonly detalles?: unknown;

  constructor(parametros: ParametrosErrorAplicacion) {
    super(parametros.mensaje);
    this.name = 'ErrorAplicacion';
    this.codigo = parametros.codigo;
    this.estadoHttp = parametros.estadoHttp;
    this.detalles = parametros.detalles;
  }
}

export class ErrorValidacion extends ErrorAplicacion {
  constructor(mensaje: string, detalles?: unknown) {
    super({
      codigo: 'VALIDACION_INVALIDA',
      mensaje,
      estadoHttp: 400,
      detalles,
    });
    this.name = 'ErrorValidacion';
  }
}

export class ErrorNoImplementado extends ErrorAplicacion {
  constructor(mensaje: string, detalles?: unknown) {
    super({
      codigo: 'NO_IMPLEMENTADO',
      mensaje,
      estadoHttp: 501,
      detalles,
    });
    this.name = 'ErrorNoImplementado';
  }
}

export class ErrorSesionNoDisponible extends ErrorAplicacion {
  constructor(mensaje: string, detalles?: unknown) {
    super({
      codigo: 'SESION_NO_DISPONIBLE',
      mensaje,
      estadoHttp: 409,
      detalles,
    });
    this.name = 'ErrorSesionNoDisponible';
  }
}

export class ErrorSesionInvalida extends ErrorAplicacion {
  constructor(mensaje: string, detalles?: unknown) {
    super({
      codigo: 'SESION_INVALIDA',
      mensaje,
      estadoHttp: 422,
      detalles,
    });
    this.name = 'ErrorSesionInvalida';
  }
}

export class ErrorSesionExpirada extends ErrorAplicacion {
  constructor(mensaje: string, detalles?: unknown) {
    super({
      codigo: 'SESION_EXPIRADA',
      mensaje,
      estadoHttp: 401,
      detalles,
    });
    this.name = 'ErrorSesionExpirada';
  }
}

export class ErrorCuentaNoEncontrada extends ErrorAplicacion {
  constructor(mensaje: string, detalles?: unknown) {
    super({
      codigo: 'CUENTA_NO_ENCONTRADA',
      mensaje,
      estadoHttp: 404,
      detalles,
    });
    this.name = 'ErrorCuentaNoEncontrada';
  }
}

export class ErrorCuentaPrivada extends ErrorAplicacion {
  constructor(mensaje: string, detalles?: unknown) {
    super({
      codigo: 'CUENTA_PRIVADA',
      mensaje,
      estadoHttp: 403,
      detalles,
    });
    this.name = 'ErrorCuentaPrivada';
  }
}

export class ErrorSinResultados extends ErrorAplicacion {
  constructor(mensaje: string, detalles?: unknown) {
    super({
      codigo: 'SIN_RESULTADOS',
      mensaje,
      estadoHttp: 404,
      detalles,
    });
    this.name = 'ErrorSinResultados';
  }
}

export function esErrorAplicacion(error: unknown): error is ErrorAplicacion {
  return error instanceof ErrorAplicacion;
}
