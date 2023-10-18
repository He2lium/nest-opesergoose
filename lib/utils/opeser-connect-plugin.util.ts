import {Schema} from "mongoose";
import {OpeserService} from "../opeser.service";
import {OpesergooseFactory, OpeserOptions} from "opesergoose";
import {OpeserMappingStorage} from "../storage/opeser-mapping.storage";
import {OpeserPluginConnector} from "../types/opeser-plugin-connector.type";

export const OpeserConnectPluginFactory = (client: OpeserService):OpeserPluginConnector =>
    (
        index: string,
        schema: Schema,
        options: Omit<OpeserOptions.PluginOptions<unknown>, "index"|"mapProperties">
    )=> {
    schema.plugin(OpesergooseFactory(client),{
        ...options,
        index,
        mapProperties: OpeserMappingStorage.getSchemaByIndex(index).map ?? {},
    })
}