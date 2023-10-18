import {OpeserOptions} from "opesergoose";
import {OpeserMappingStorage} from "../storage/opeser-mapping.storage";

export const OpeserPluginOptionFactory =
    (
        index: string,
        options?: Omit<OpeserOptions.PluginOptions<{}>, "index"|"mapProperties">
    ):OpeserOptions.PluginOptions<{}> =>({
        ...(options??{}),
        index,
        mapProperties: OpeserMappingStorage.getSchemaByIndex(index)
    })