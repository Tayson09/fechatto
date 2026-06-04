export class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Não autorizado", 401)
  }
}