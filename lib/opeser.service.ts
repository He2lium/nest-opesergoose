import {Injectable} from "@nestjs/common";
import {Client} from "@opensearch-project/opensearch";
import {OpeserOptions} from "./types/opeser-module-options.type";
import {OpeserMappingStorage} from "./storage/opeser-mapping.storage";
import {MappingProperty} from "@opensearch-project/opensearch/api/types";
import omitDeep from 'omit-deep'

@Injectable()
export class OpeserService extends Client {

    private readonly forbiddenFields: { [index: string]: string[] } = {}
    private readonly schemaMapping: { [index: string]: Record<string, MappingProperty> } = {}

    constructor(options: OpeserOptions) {
        super(options);
        for (let schema of OpeserMappingStorage.getSchemas) {
            if (!schema.index) continue;
            this.schemaMapping[schema.index] = schema.map

            if (schema.forbiddenFields)
                this.forbiddenFields[schema.index] = schema.forbiddenFields
        }
    }

    private omit(index: string, document: any) {
        const forbiddenFields = this.forbiddenFields[index] ?? []
        return omitDeep(document, [...new Set([...forbiddenFields, 'id', '_id', '__v'])])
    }

    async OgMap() {

    }

    async OgIndex(index: string, document: any, refresh: boolean = true) {
        return this.index({
            index,
            id: document._id.toString(),
            body: this.omit(index, document),
            refresh
        })
    }

    async OgBulk(index: string, documents: any[]) {
        const body = documents.flatMap((document) => {
            return [{ index: { _index: `${index}`, _id: document._id.toString() } }, this.omit(index, document)]
        })
        if (body.length) await this.bulk({ body })
    }

    async OgDelete(index: string, id: string, refresh: boolean = true){
        return this.delete({
            index,
            id,
            refresh
        })
    }
}