export class FieldValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "FieldValidationError"
    }
}
export class NotFoundPrimaryKeyError extends Error {
    constructor() {
        super("A tabela não possui uma chave primária.")
        this.name = "NotFoundPrimaryKeyError"
    }
}

export class NotFoundFieldsError extends Error {
    constructor() {
        super("A tabela não possui campos definidos.")
        this.name = "NotFoundFieldsError"
    }
}

class FieldTypeError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "FieldTypeError"
    }
}

export class StringTypeError extends FieldTypeError {
    constructor(key: string) {
        super(`O campo ${key} deve ser do tipo string.`)
    }
}
export class NumberTypeError extends FieldTypeError {
    constructor(key: string) {
        super(`O campo ${key} deve ser do tipo number.`)
    }
}
export class BooleanTypeError extends FieldTypeError {
    constructor(key: string) {
        super(`O campo ${key} deve ser do tipo boolean.`)
    }
}
export class DateTypeError extends FieldTypeError {
    constructor(key: string) {
        super(`O campo ${key} deve ser do tipo date.`)
    }
}
export class EnumTypeError extends FieldTypeError {
    constructor(key: string, enumValues: any[]) {
        super(`O campo ${key} deve ser um dos seguintes valores: ${enumValues.join(", ")}.`)
    }
}
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "NotFoundError"
    }
}