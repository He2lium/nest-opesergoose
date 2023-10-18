import {OpeserOptions} from "opesergoose";
import {OpeserMappingStorage} from "../storage/opeser-mapping.storage";

export const OpeserPluginOptionFactory =
    <DocumentType>(
        index: string,
        options?: Omit<OpeserOptions.PluginOptions<DocumentType>, "index"|"mapProperties">
    ):OpeserOptions.PluginOptions<DocumentType> =>({
        ...(options??{}),
        index,
        mapProperties: OpeserMappingStorage.getSchemaByIndex(index)
    })