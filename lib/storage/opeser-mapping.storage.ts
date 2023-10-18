import {OpeserStorageType} from "../types/opeser-storage.type";
import field = OpeserStorageType.field;
import schema = OpeserStorageType.schema;

export class EsMapStorage {
    private schemas: schema[] = []
    private fields: field[] = []

    setProp(field: field) {
        this.fields.push(field)
    }

    getProps(className: string) {
        return this.fields.filter((field) => field.parent === className)
    }

    getSchemaByClass(className: string) {
        return this.schemas.find((schema) => schema.class === className)
    }

    getSchemaByIndex(className: string) {
        return this.schemas.find((schema) => schema.index === className)
    }

    setSchema(schema: schema) {
        this.schemas.push(schema)
    }
}

// Global es-map storage
const globalRef = global as any
export const ESMapGlobalStorage =
    globalRef.EsMapStorage || (globalRef.EsMapStorage = new EsMapStorage())