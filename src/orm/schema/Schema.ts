type SchemaFieldType = "string" | "number" | "boolean" | "date" | "enum"

export interface TableSchema<T> {
    tableName: string,
    fields: TableSchemaFields<T>
}
export type TableSchemaFields<T> = {
    [K in keyof T]: T[K] extends string ? Record<keyof T, StringFieldMetadata >[K] :
    T[K] extends number ? Record<keyof T, NumberFieldMetadata>[K] :
    T[K] extends Date ? Record<keyof T, DateFieldMetadata>[K] :
    Record<keyof T, TableFieldMetadata>[K]

}

interface TableFieldMetadata {
    type?: SchemaFieldType,
    isAutoIncrement?: boolean,
    enumValues?: any[],
    defaultValue?: any,
    isUnique?: boolean,
    isPrimaryKey?: boolean
    primaryKeyType?: "cuid" | "uuid" | "serial",
    required: boolean,
}

interface StringFieldMetadata extends TableFieldMetadata {
    type: "string",
    primaryKey: (value: "cuid" | "uuid") => StringFieldMetadata,
    unique: (this: StringFieldMetadata) => StringFieldMetadata
}
interface NumberFieldMetadata extends TableFieldMetadata {
    type: "number",
    primaryKey: (value?: "serial") => NumberFieldMetadata
    unique: (this: NumberFieldMetadata) => NumberFieldMetadata
}
interface DateFieldMetadata extends TableFieldMetadata {
    type: "date",
    isUpdatedField?: boolean,
    createdAt: () => DateFieldMetadata,
    updatedAt: () => DateFieldMetadata,
}
const defaultTableValues: TableFieldMetadata = {
    type: undefined,
    isUnique: false,
    isAutoIncrement: undefined,
    isPrimaryKey: false,
    enumValues: undefined,
    primaryKeyType: undefined,
    required: true,
    defaultValue: undefined,
}
export class Table<T> implements TableSchema<T> {
    public tableName: string
    public fields: TableSchemaFields<T>

    constructor(tableName: string, fields: TableSchemaFields<T>) {
        this.tableName = tableName
        this.fields = fields
        
    }
}
function table<T>(tableName: string, fields: TableSchemaFields<T>): TableSchema<T>  {
    const payload = {
        tableName,
        fields
    }
    return payload
}




function string(defaultValue?: string): StringFieldMetadata {
    return {
        ...defaultTableValues,
        type: "string",
        defaultValue,
        unique: function() {
            return {
                ...this,
                isUnique: true
            }
        },
        primaryKey: function (value) {
            return {
                ...this,
                required: false,
                isPrimaryKey: true,
                isUnique: true,
                primaryKeyType: value,
            }
        }
    }
}
function number(defaultValue?: number): NumberFieldMetadata {
    return {
        ...defaultTableValues,
        type: "number",
        defaultValue,
        unique: function() {
            return {
                ...this,
                isUnique: true
            }
        },
        primaryKey: function (value = "serial") {
            return {
                ...this,
                required: false,
                isPrimaryKey: true,
                isUnique: true,
                primaryKeyType: value,
            }
        }
    }
}
function boolean(defaultValue?: boolean): TableFieldMetadata {
    return {
        ...defaultTableValues,
        type: "boolean",
        defaultValue
    }
}
function date(defaultValue?: Date | string): DateFieldMetadata {
    return {
        ...defaultTableValues,
        type: "date",
        defaultValue,
        isUpdatedField: undefined,
        createdAt: function () {
            return {
                ...this,
                required: false,
                defaultValue: new Date().toISOString()
            }
        },
        updatedAt: function () {
            return {
                ...this,
                required: false,
                isUpdatedField: true
            }
        }
    }
}
function enumType<T extends Record<string, string | number>>(enumValues: T, defaultValue: keyof T): TableFieldMetadata {
    return {
        ...defaultTableValues,
        type: "enum",
        enumValues: Object.values(enumValues),
        defaultValue
    }
}

type InferSchema<T extends TableSchema<any>> = {
    [K in keyof T["fields"]]: T["fields"][K] extends { type: "string" }
        ? string
        : T["fields"][K] extends { type: "number" }
        ? number
        : T["fields"][K] extends { type: "boolean" }
        ? boolean
        : T["fields"][K] extends { type: "date" }
        ? Date | string
        : T["fields"][K] extends { type: "enum"; enumValues: infer U }
        ? U extends Array<infer V>
            ? V
            : never
        : unknown;
};

export { InferSchema };
export const j = {table, string, number, boolean, date, enumType}