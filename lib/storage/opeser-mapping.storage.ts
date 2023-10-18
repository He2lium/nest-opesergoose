import { OpeserStorageType } from "../types/opeser-storage.type";
import field = OpeserStorageType.field;
import schema = OpeserStorageType.schema;

export class OpeserMappingStorageClass {
  private schemas: schema[] = [];
  private fields: field[] = [];

  setProp(field: field) {
    this.fields.push(field);
  }

  getProps(className: string) {
    return this.fields.filter((field) => field.parent === className);
  }

  getSchemaByClass(className: string) {
    return this.schemas.find((schema) => schema.class === className);
  }

  getSchemaByIndex(indexName: string) {
    return this.schemas.find((schema) => schema.index === indexName);
  }

  setSchema(schema: schema) {
    this.schemas.push(schema);
  }
}

// Global es-map storage
const globalRef = global as typeof globalThis & {
  OpeserMappingStorage: OpeserMappingStorageClass;
};
export const OpeserMappingStorage =
  globalRef.OpeserMappingStorage ||
  (globalRef.OpeserMappingStorage = new OpeserMappingStorageClass());
