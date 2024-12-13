type FieldTypes = "string" | "number" | "boolean"  | "date" | "enum"
type PrimaryKeyTypes = "cuid" | "serial"
type Constructor<T = {}> = new (...args: any[]) => T;

interface FieldOptions {
    required?: boolean
    unique?: boolean
    default?: any
    enumValues?: any[]
}
interface MetaFieldsOptions extends FieldOptions {
    type: FieldTypes & PrimaryKeyTypes
}

